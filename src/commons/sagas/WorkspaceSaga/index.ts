import { FSModule } from 'browserfs/dist/node/core/FS';
import { Context, findDeclaration, getNames } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';
import Phaser from 'phaser';
import { call, put, select } from 'redux-saga/effects';
import InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import { combineSagaHandlers } from 'src/commons/redux/utils';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import CseMachine from 'src/features/cseMachine/CseMachine';

import { EventType } from '../../../features/achievement/AchievementTypes';
import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import { WORKSPACE_BASE_PATHS } from '../../../pages/fileSystem/createInBrowserFileSystem';
import {
  defaultEditorValue,
  OverallState,
  styliseSublanguage
} from '../../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../../application/types/ExternalTypes';
import { Library, Testcase } from '../../assessment/AssessmentTypes';
import { Documentation } from '../../documentation/Documentation';
import { writeFileRecursively } from '../../fileSystem/utils';
import { actions } from '../../utils/ActionsHelper';
import {
  highlightClean,
  highlightCleanForControl,
  highlightLine,
  highlightLineForControl
} from '../../utils/JsSlangHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../utils/notifications/NotificationsHelper';
import { showFullJSDisclaimer, showFullTSDisclaimer } from '../../utils/WarningDialogHelper';
import { EditorTabState } from '../../workspace/WorkspaceTypes';
import { evalCodeSaga } from './helpers/evalCode';
import { evalEditorSaga } from './helpers/evalEditor';
import { runTestCase } from './helpers/runTestCase';

const WorkspaceSaga = combineSagaHandlers(
  // TODO: Refactor and combine in a future commit
  { ...WorkspaceActions, ...InterpreterActions },
  {
    addHtmlConsoleError: function* (action) {
      // TODO: Do not use if-else logic
      if (!action.payload.storyEnv) {
        yield put(
          actions.handleConsoleLog(action.payload.workspaceLocation, action.payload.errorMsg)
        );
      } else {
        yield put(
          actions.handleStoriesConsoleLog(action.payload.storyEnv, action.payload.errorMsg)
        );
      }
    },
    toggleFolderMode: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      const isFolderModeEnabled: boolean = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled
      );
      yield put(actions.setFolderMode(workspaceLocation, !isFolderModeEnabled));
      const warningMessage = `Folder mode ${!isFolderModeEnabled ? 'enabled' : 'disabled'}`;
      yield call(showWarningMessage, warningMessage, 750);
    },
    setFolderMode: function* (action): any {
      const workspaceLocation = action.payload.workspaceLocation;
      const isFolderModeEnabled: boolean = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled
      );
      // Do nothing if Folder mode is enabled.
      if (isFolderModeEnabled) {
        return;
      }

      const editorTabs: EditorTabState[] = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].editorTabs
      );
      // If Folder mode is disabled and there are no open editor tabs, add an editor tab.
      if (editorTabs.length === 0) {
        const defaultFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.js`;
        const fileSystem: FSModule | null = yield select(
          (state: OverallState) => state.fileSystem.inBrowserFileSystem
        );
        // If the file system is not initialised, add an editor tab with the default editor value.
        if (fileSystem === null) {
          yield put(actions.addEditorTab(workspaceLocation, defaultFilePath, defaultEditorValue));
          return;
        }
        const editorValue: string = yield new Promise((resolve, reject) => {
          fileSystem.exists(defaultFilePath, fileExists => {
            if (!fileExists) {
              // If the file does not exist, we need to also create it in the file system.
              writeFileRecursively(fileSystem, defaultFilePath, defaultEditorValue)
                .then(() => resolve(defaultEditorValue))
                .catch(err => reject(err));
              return;
            }
            fileSystem.readFile(defaultFilePath, 'utf-8', (err, fileContents) => {
              if (err) {
                reject(err);
                return;
              }
              if (fileContents === undefined) {
                reject(new Error('File exists but has no contents.'));
                return;
              }
              resolve(fileContents);
            });
          });
        });
        yield put(actions.addEditorTab(workspaceLocation, defaultFilePath, editorValue));
      }
    },
    // Mirror editor updates to the associated file in the filesystem.
    updateEditorValue: function* (action): any {
      const workspaceLocation = action.payload.workspaceLocation;
      const editorTabIndex = action.payload.editorTabIndex;

      const filePath: string | undefined = yield select(
        (state: OverallState) =>
          state.workspaces[workspaceLocation].editorTabs[editorTabIndex].filePath
      );
      // If the code does not have an associated file, do nothing.
      if (filePath === undefined) {
        return;
      }

      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );
      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        return;
      }

      fileSystem.writeFile(filePath, action.payload.newEditorValue, err => {
        if (err) {
          console.error(err);
        }
      });
      yield;
    },
    evalEditor: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      yield* evalEditorSaga(workspaceLocation);
    },
    promptAutocomplete: function* (action): any {
      const workspaceLocation = action.payload.workspaceLocation;

      const context: Context = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].context
      );

      const code: string = yield select((state: OverallState) => {
        const prependCode = state.workspaces[workspaceLocation].programPrependValue;
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        const editorCode = state.workspaces[workspaceLocation].editorTabs[0].value;
        return [prependCode, editorCode] as [string, string];
      });
      const [prepend, editorValue] = code;

      // Deal with prepended code
      let autocompleteCode;
      let prependLength = 0;
      if (!prepend) {
        autocompleteCode = editorValue;
      } else {
        prependLength = prepend.split('\n').length;
        autocompleteCode = prepend + '\n' + editorValue;
      }

      const [editorNames, displaySuggestions] = yield call(
        getNames,
        autocompleteCode,
        action.payload.row + prependLength,
        action.payload.column,
        context
      );

      if (!displaySuggestions) {
        yield call(action.payload.callback);
        return;
      }

      const editorSuggestions = editorNames.map((name: any) => {
        return {
          ...name,
          caption: name.name,
          value: name.name,
          score: name.score ? name.score + 1000 : 1000, // Prioritize suggestions from code
          name: undefined
        };
      });

      let chapterName = context.chapter.toString();
      const variant = context.variant ?? Variant.DEFAULT;
      if (variant !== Variant.DEFAULT) {
        chapterName += '_' + variant;
      }

      const builtinSuggestions = Documentation.builtins[chapterName] || [];

      const extLib = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].externalLibrary
      );

      const extLibSuggestions = Documentation.externalLibraries[extLib] || [];

      yield call(
        action.payload.callback,
        null,
        editorSuggestions.concat(builtinSuggestions, extLibSuggestions)
      );
    },
    toggleEditorAutorun: function* (action): any {
      const workspaceLocation = action.payload.workspaceLocation;
      const isEditorAutorun = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isEditorAutorun
      );
      yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
    },
    evalRepl: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      const code: string = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].replValue
      );
      const execTime: number = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].execTime
      );
      yield put(actions.beginInterruptExecution(workspaceLocation));
      yield put(actions.clearReplInput(workspaceLocation));
      yield put(actions.sendReplInputToOutput(code, workspaceLocation));
      const context: Context = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].context
      );
      // Reset old context.errors
      context.errors = [];
      const codeFilePath = '/code.js';
      const codeFiles = {
        [codeFilePath]: code
      };
      yield call(
        evalCodeSaga,
        codeFiles,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        WorkspaceActions.evalRepl.type
      );
    },
    debuggerResume: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      const code: string = yield select(
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        (state: OverallState) => state.workspaces[workspaceLocation].editorTabs[0].value
      );
      const execTime: number = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].execTime
      );
      yield put(actions.beginInterruptExecution(workspaceLocation));
      /** Clear the context, with the same chapter and externalSymbols as before. */
      yield put(actions.clearReplOutput(workspaceLocation));
      const context: Context = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].context
      );
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
      const codeFilePath = '/code.js';
      const codeFiles = {
        [codeFilePath]: code
      };
      yield call(
        evalCodeSaga,
        codeFiles,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        InterpreterActions.debuggerResume.type
      );
    },
    debuggerReset: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      const context: Context = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].context
      );
      yield put(actions.clearReplOutput(workspaceLocation));
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
      context.runtime.break = false;
      yield put(actions.updateLastDebuggerResult(undefined, workspaceLocation));
    },
    setEditorHighlightedLines: function* (action): any {
      const newHighlightedLines = action.payload.newHighlightedLines;
      if (newHighlightedLines.length === 0) {
        highlightClean();
      } else {
        try {
          newHighlightedLines.forEach(([startRow, endRow]: [number, number]) => {
            for (let row = startRow; row <= endRow; row++) {
              highlightLine(row);
            }
          });
        } catch (e) {
          // Error most likely caused by trying to highlight the lines of the prelude
          // in CSE Machine. Can be ignored.
        }
      }
      yield;
    },
    setEditorHighlightedLinesControl: function* (action): any {
      const newHighlightedLines = action.payload.newHighlightedLines;
      if (newHighlightedLines.length === 0) {
        yield call(highlightCleanForControl);
      } else {
        try {
          for (const [startRow, endRow] of newHighlightedLines) {
            for (let row = startRow; row <= endRow; row++) {
              yield call(highlightLineForControl, row);
            }
          }
        } catch (e) {
          // Error most likely caused by trying to highlight the lines of the prelude
          // in CSE Machine. Can be ignored.
        }
      }
    },
    evalTestcase: function* (action) {
      yield put(actions.addEvent([EventType.RUN_TESTCASE]));
      const workspaceLocation = action.payload.workspaceLocation;
      const index = action.payload.testcaseId;
      yield* runTestCase(workspaceLocation, index);
    },
    chapterSelect: function* (action) {
      const { workspaceLocation, chapter: newChapter, variant: newVariant } = action.payload;
      const [oldVariant, oldChapter, symbols, globals, externalLibraryName]: [
        Variant,
        Chapter,
        string[],
        Array<[string, any]>,
        ExternalLibraryName
      ] = yield select((state: OverallState) => [
        state.workspaces[workspaceLocation].context.variant,
        state.workspaces[workspaceLocation].context.chapter,
        state.workspaces[workspaceLocation].context.externalSymbols,
        state.workspaces[workspaceLocation].globals,
        state.workspaces[workspaceLocation].externalLibrary
      ]);

      const chapterChanged: boolean = newChapter !== oldChapter || newVariant !== oldVariant;
      const toChangeChapter: boolean =
        newChapter === Chapter.FULL_JS
          ? chapterChanged && (yield call(showFullJSDisclaimer))
          : newChapter === Chapter.FULL_TS
            ? chapterChanged && (yield call(showFullTSDisclaimer))
            : chapterChanged;

      if (toChangeChapter) {
        const library: Library = {
          chapter: newChapter,
          variant: newVariant,
          external: {
            name: externalLibraryName,
            symbols
          },
          globals
        };
        yield put(actions.beginClearContext(workspaceLocation, library, false));
        yield put(actions.clearReplOutput(workspaceLocation));
        yield put(actions.debuggerReset(workspaceLocation));
        if (workspaceLocation !== 'stories') yield put(actions.resetSideContent(workspaceLocation));
        yield call(
          showSuccessMessage,
          `Switched to ${styliseSublanguage(newChapter, newVariant)}`,
          1000
        );
      }
    },
    /**
     * Note that the PLAYGROUND_EXTERNAL_SELECT action is made to
     * select the library for playground.
     * This is because assessments do not have a chapter & library select, the question
     * specifies the chapter and library to be used.
     *
     * To abstract this to assessments, the state structure must be manipulated to store
     * the external library name in a WorkspaceState (as compared to IWorkspaceManagerState).
     *
     * @see IWorkspaceManagerState @see WorkspaceState
     */
    externalLibrarySelect: function* (action) {
      const { workspaceLocation, externalLibraryName: newExternalLibraryName } = action.payload;
      const [chapter, globals, oldExternalLibraryName]: [
        Chapter,
        Array<[string, any]>,
        ExternalLibraryName
      ] = yield select((state: OverallState) => [
        state.workspaces[workspaceLocation].context.chapter,
        state.workspaces[workspaceLocation].globals,
        state.workspaces[workspaceLocation].externalLibrary
      ]);
      const symbols = externalLibraries.get(newExternalLibraryName)!;
      const library: Library = {
        chapter,
        external: {
          name: newExternalLibraryName,
          symbols
        },
        globals
      };
      if (newExternalLibraryName !== oldExternalLibraryName || action.payload.initialise) {
        yield put(actions.changeExternalLibrary(newExternalLibraryName, workspaceLocation));
        yield put(actions.beginClearContext(workspaceLocation, library, true));
        yield put(actions.clearReplOutput(workspaceLocation));
        if (!action.payload.initialise) {
          yield call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000);
        }
      }
    },
    /**
     * Handles the side effect of resetting the WebGL context when context is reset.
     *
     * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
     * the function.
     */
    beginClearContext: function* (action): any {
      yield call([DataVisualizer, DataVisualizer.clear]);
      yield call([CseMachine, CseMachine.clear]);
      const globals: Array<[string, any]> = action.payload.library.globals as Array<[string, any]>;
      for (const [key, value] of globals) {
        window[key as any] = value;
      }
      yield put(
        actions.endClearContext(
          {
            ...action.payload.library,
            moduleParams: {
              runes: {},
              phaser: Phaser
            }
          },
          action.payload.workspaceLocation
        )
      );
      yield undefined;
    },
    navigateToDeclaration: function* (action) {
      const workspaceLocation = action.payload.workspaceLocation;
      const code: string = yield select(
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        (state: OverallState) => state.workspaces[workspaceLocation].editorTabs[0].value
      );
      const context: Context = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].context
      );

      const result = findDeclaration(code, context, {
        line: action.payload.cursorPosition.row + 1,
        column: action.payload.cursorPosition.column
      });
      if (result) {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        yield put(
          actions.moveCursor(action.payload.workspaceLocation, 0, {
            row: result.start.line - 1,
            column: result.start.column
          })
        );
      }
    },
    // TODO: Should be takeLeading, not takeEvery
    runAllTestcases: function* (action): any {
      const { workspaceLocation } = action.payload;

      yield call(evalEditorSaga, workspaceLocation);

      const testcases: Testcase[] = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].editorTestcases
      );
      // Avoid displaying message if there are no testcases
      if (testcases.length > 0) {
        // Display a message to the user
        yield call(showSuccessMessage, `Running all testcases!`, 2000);
        for (const idx of testcases.keys()) {
          // break each testcase up into separate event loop iterations
          // so that the UI updates
          yield new Promise(resolve => setTimeout(resolve, 0));

          const programSucceeded: boolean = yield call(runTestCase, workspaceLocation, idx);
          // Prematurely terminate if execution of the program failed (not the testcase)
          if (!programSucceeded) {
            return;
          }
        }
      }
    }
  }
);

export default WorkspaceSaga;
