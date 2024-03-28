import { FSModule } from 'browserfs/dist/node/core/FS';
import { Context, findDeclaration, getNames } from 'js-slang';
import { Chapter, Variant } from 'js-slang/dist/types';
import Phaser from 'phaser';
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import CseMachine from 'src/features/cseMachine/CseMachine';
import { EVAL_STORY } from 'src/features/stories/StoriesTypes';

import { EventType } from '../../../features/achievement/AchievementTypes';
import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import { WORKSPACE_BASE_PATHS } from '../../../pages/fileSystem/createInBrowserFileSystem';
import {
  defaultEditorValue,
  OverallState,
  styliseSublanguage
} from '../../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../../application/types/ExternalTypes';
import {
  DEBUG_RESET,
  DEBUG_RESUME,
  UPDATE_EDITOR_HIGHLIGHTED_LINES,
  UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL
} from '../../application/types/InterpreterTypes';
import { Library, Testcase } from '../../assessment/AssessmentTypes';
import { Documentation } from '../../documentation/Documentation';
import { writeFileRecursively } from '../../fileSystem/utils';
import { resetSideContent } from '../../sideContent/SideContentActions';
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
import {
  ADD_HTML_CONSOLE_ERROR,
  BEGIN_CLEAR_CONTEXT,
  CHAPTER_SELECT,
  EditorTabState,
  EVAL_EDITOR,
  EVAL_EDITOR_AND_TESTCASES,
  EVAL_REPL,
  EVAL_TESTCASE,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  PROMPT_AUTOCOMPLETE,
  SET_FOLDER_MODE,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_FOLDER_MODE,
  UPDATE_EDITOR_VALUE
} from '../../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery, safeTakeLeading as takeLeading } from '../SafeEffects';
import { evalCode } from './helpers/evalCode';
import { evalEditor } from './helpers/evalEditor';
import { runTestCase } from './helpers/runTestCase';

export default function* WorkspaceSaga(): SagaIterator {
  let context: Context;

  yield takeEvery(
    ADD_HTML_CONSOLE_ERROR,
    function* (action: ReturnType<typeof actions.addHtmlConsoleError>) {
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
    }
  );

  yield takeEvery(
    TOGGLE_FOLDER_MODE,
    function* (action: ReturnType<typeof actions.toggleFolderMode>) {
      const workspaceLocation = action.payload.workspaceLocation;
      const isFolderModeEnabled: boolean = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled
      );
      yield put(actions.setFolderMode(workspaceLocation, !isFolderModeEnabled));
      const warningMessage = `Folder mode ${!isFolderModeEnabled ? 'enabled' : 'disabled'}`;
      yield call(showWarningMessage, warningMessage, 750);
    }
  );

  yield takeEvery(SET_FOLDER_MODE, function* (action: ReturnType<typeof actions.setFolderMode>) {
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
  });

  // Mirror editor updates to the associated file in the filesystem.
  yield takeEvery(
    UPDATE_EDITOR_VALUE,
    function* (action: ReturnType<typeof actions.updateEditorValue>) {
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
    }
  );

  yield takeEvery(EVAL_EDITOR, function* (action: ReturnType<typeof actions.evalEditor>) {
    const workspaceLocation = action.payload.workspaceLocation;
    yield* evalEditor(workspaceLocation);
  });

  yield takeEvery(
    PROMPT_AUTOCOMPLETE,
    function* (action: ReturnType<typeof actions.promptAutocomplete>): any {
      const workspaceLocation = action.payload.workspaceLocation;

      context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);

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
    }
  );

  yield takeEvery(
    TOGGLE_EDITOR_AUTORUN,
    function* (action: ReturnType<typeof actions.toggleEditorAutorun>): any {
      const workspaceLocation = action.payload.workspaceLocation;
      const isEditorAutorun = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isEditorAutorun
      );
      yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
    }
  );

  yield takeEvery(EVAL_REPL, function* (action: ReturnType<typeof actions.evalRepl>) {
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
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    // Reset old context.errors
    context.errors = [];
    const codeFilePath = '/code.js';
    const codeFiles = {
      [codeFilePath]: code
    };
    yield call(evalCode, codeFiles, codeFilePath, context, execTime, workspaceLocation, EVAL_REPL);
  });

  yield takeEvery(EVAL_STORY, function* (action: ReturnType<typeof actions.evalStory>) {
    const env = action.payload.env;
    const code = action.payload.code;
    const execTime: number = yield select(
      (state: OverallState) => state.stories.envs[env].execTime
    );
    context = yield select((state: OverallState) => state.stories.envs[env].context);
    const codeFilePath = '/code.js';
    const codeFiles = {
      [codeFilePath]: code
    };
    yield put(resetSideContent(`stories.${env}`));
    yield call(evalCode, codeFiles, codeFilePath, context, execTime, 'stories', EVAL_STORY, env);
  });

  yield takeEvery(DEBUG_RESUME, function* (action: ReturnType<typeof actions.debuggerResume>) {
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
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
    const codeFilePath = '/code.js';
    const codeFiles = {
      [codeFilePath]: code
    };
    yield call(
      evalCode,
      codeFiles,
      codeFilePath,
      context,
      execTime,
      workspaceLocation,
      DEBUG_RESUME
    );
  });

  yield takeEvery(DEBUG_RESET, function* (action: ReturnType<typeof actions.debuggerReset>) {
    const workspaceLocation = action.payload.workspaceLocation;
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    yield put(actions.clearReplOutput(workspaceLocation));
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
    context.runtime.break = false;
    yield put(actions.updateLastDebuggerResult(undefined, workspaceLocation));
  });

  yield takeEvery(
    UPDATE_EDITOR_HIGHLIGHTED_LINES,
    function* (action: ReturnType<typeof actions.setEditorHighlightedLines>) {
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
    }
  );

  yield takeEvery(
    UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL,
    function* (action: ReturnType<typeof actions.setEditorHighlightedLines>) {
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
    }
  );

  yield takeEvery(EVAL_TESTCASE, function* (action: ReturnType<typeof actions.evalTestcase>) {
    yield put(actions.addEvent([EventType.RUN_TESTCASE]));
    const workspaceLocation = action.payload.workspaceLocation;
    const index = action.payload.testcaseId;
    yield* runTestCase(workspaceLocation, index);
  });

  yield takeEvery(CHAPTER_SELECT, function* (action: ReturnType<typeof actions.chapterSelect>) {
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
  });

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
  yield takeEvery(
    PLAYGROUND_EXTERNAL_SELECT,
    function* (action: ReturnType<typeof actions.externalLibrarySelect>) {
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
    }
  );

  /**
   * Handles the side effect of resetting the WebGL context when context is reset.
   *
   * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
   * the function.
   */
  yield takeEvery(
    BEGIN_CLEAR_CONTEXT,
    function* (action: ReturnType<typeof actions.beginClearContext>) {
      yield call([DataVisualizer, DataVisualizer.clear]);
      yield call([CseMachine, CseMachine.clear]);
      const globals: Array<[string, any]> = action.payload.library.globals as Array<[string, any]>;
      for (const [key, value] of globals) {
        window[key] = value;
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
    }
  );

  yield takeEvery(
    NAV_DECLARATION,
    function* (action: ReturnType<typeof actions.navigateToDeclaration>) {
      const workspaceLocation = action.payload.workspaceLocation;
      const code: string = yield select(
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        (state: OverallState) => state.workspaces[workspaceLocation].editorTabs[0].value
      );
      context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);

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
    }
  );

  yield takeLeading(
    EVAL_EDITOR_AND_TESTCASES,
    function* (action: ReturnType<typeof actions.runAllTestcases>) {
      const { workspaceLocation } = action.payload;

      yield call(evalEditor, workspaceLocation);

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
  );
}
