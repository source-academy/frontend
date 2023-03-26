import { FSModule } from 'browserfs/dist/node/core/FS';
import {
  Context,
  findDeclaration,
  getNames,
  interrupt,
  parseError,
  Result,
  resume,
  runInContext
} from 'js-slang';
import { TRY_AGAIN } from 'js-slang/dist/constants';
import { defineSymbol } from 'js-slang/dist/createContext';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { parse } from 'js-slang/dist/parser/parser';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { typeCheck } from 'js-slang/dist/typeChecker/typeChecker';
import { Chapter, Variant } from 'js-slang/dist/types';
import { validateAndAnnotate } from 'js-slang/dist/validator/validator';
import { random } from 'lodash';
import Phaser from 'phaser';
import { SagaIterator } from 'redux-saga';
import { call, put, race, select, StrictEffect, take } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { EventType } from '../../features/achievement/AchievementTypes';
import DataVisualizer from '../../features/dataVisualizer/dataVisualizer';
import { DeviceSession } from '../../features/remoteExecution/RemoteExecutionTypes';
import { WORKSPACE_BASE_PATHS } from '../../pages/fileSystem/createInBrowserFileSystem';
import {
  isSourceLanguage,
  OverallState,
  styliseSublanguage
} from '../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  UPDATE_EDITOR_HIGHLIGHTED_LINES
} from '../application/types/InterpreterTypes';
import { Library, Testcase, TestcaseType, TestcaseTypes } from '../assessment/AssessmentTypes';
import { Documentation } from '../documentation/Documentation';
import { retrieveFilesInWorkspaceAsRecord } from '../fileSystem/utils';
import { SideContentType } from '../sideContent/SideContentTypes';
import { actions } from '../utils/ActionsHelper';
import DisplayBufferService from '../utils/DisplayBufferService';
import {
  getBlockExtraMethodsString,
  getDifferenceInMethods,
  getRestoreExtraMethodsString,
  getStoreExtraMethodsString,
  highlightClean,
  highlightLine,
  makeElevatedContext,
  visualizeEnv
} from '../utils/JsSlangHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from '../utils/SourcerorHelper';
import { showFullJSDisclaimer, showFullTSDisclaimer } from '../utils/WarningDialogHelper';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import {
  ADD_HTML_CONSOLE_ERROR,
  BEGIN_CLEAR_CONTEXT,
  CHAPTER_SELECT,
  EditorTabState,
  END_CLEAR_CONTEXT,
  EVAL_EDITOR,
  EVAL_EDITOR_AND_TESTCASES,
  EVAL_REPL,
  EVAL_SILENT,
  EVAL_TESTCASE,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  PlaygroundWorkspaceState,
  PROMPT_AUTOCOMPLETE,
  SicpWorkspaceState,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_FOLDER_MODE,
  UPDATE_EDITOR_VALUE,
  WorkspaceLocation
} from '../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery, safeTakeLeading as takeLeading } from './SafeEffects';

export default function* WorkspaceSaga(): SagaIterator {
  let context: Context;

  yield takeEvery(
    ADD_HTML_CONSOLE_ERROR,
    function* (action: ReturnType<typeof actions.addHtmlConsoleError>) {
      yield put(
        actions.handleConsoleLog(action.payload.workspaceLocation, action.payload.errorMsg)
      );
    }
  );

  yield takeEvery(
    TOGGLE_FOLDER_MODE,
    function* (action: ReturnType<typeof actions.toggleFolderMode>) {
      const workspaceLocation = action.payload.workspaceLocation;
      const isFolderModeEnabled: boolean = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled
      );
      const warningMessage = `Folder mode ${isFolderModeEnabled ? 'enabled' : 'disabled'}`;
      yield call(showWarningMessage, warningMessage, 750);
    }
  );

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
    yield call(evalCode, code, context, execTime, workspaceLocation, EVAL_REPL);
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
    yield call(evalCode, code, context, execTime, workspaceLocation, DEBUG_RESUME);
  });

  yield takeEvery(DEBUG_RESET, function* (action: ReturnType<typeof actions.debuggerReset>) {
    const workspaceLocation = action.payload.workspaceLocation;
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    yield put(actions.clearReplOutput(workspaceLocation));
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
    context.runtime.break = false;
    lastDebuggerResult = undefined;
  });

  yield takeEvery(
    UPDATE_EDITOR_HIGHLIGHTED_LINES,
    function* (action: ReturnType<typeof actions.setEditorHighlightedLines>) {
      const newHighlightedLines = action.payload.newHighlightedLines;
      if (newHighlightedLines.length === 0) {
        highlightClean();
      } else {
        newHighlightedLines.forEach(([startRow, _endRow]: [number, number]) =>
          highlightLine(startRow)
        );
      }
      yield;
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
      DataVisualizer.clear();
      EnvVisualizer.clear();
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

let lastDebuggerResult: any;
let lastNonDetResult: Result;
function* updateInspector(workspaceLocation: WorkspaceLocation): SagaIterator {
  try {
    const start = lastDebuggerResult.context.runtime.nodes[0].loc.start.line - 1;
    const end = lastDebuggerResult.context.runtime.nodes[0].loc.end.line - 1;
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, [[start, end]]));
    visualizeEnv(lastDebuggerResult);
  } catch (e) {
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
}

function* clearContext(workspaceLocation: WorkspaceLocation, entrypointCode: string) {
  const [chapter, symbols, externalLibraryName, globals, variant]: [
    number,
    string[],
    ExternalLibraryName,
    Array<[string, any]>,
    Variant
  ] = yield select((state: OverallState) => [
    state.workspaces[workspaceLocation].context.chapter,
    state.workspaces[workspaceLocation].context.externalSymbols,
    state.workspaces[workspaceLocation].externalLibrary,
    state.workspaces[workspaceLocation].globals,
    state.workspaces[workspaceLocation].context.variant
  ]);

  const library = {
    chapter,
    variant,
    external: {
      name: externalLibraryName,
      symbols
    },
    globals
  };

  // Clear the context, with the same chapter and externalSymbols as before.
  yield put(actions.beginClearContext(workspaceLocation, library, false));
  // Wait for the clearing to be done.
  yield take(END_CLEAR_CONTEXT);

  const context: Context = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context
  );
  defineSymbol(context, '__PROGRAM__', entrypointCode);
}

export function* dumpDisplayBuffer(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  yield put(actions.handleConsoleLog(workspaceLocation, ...DisplayBufferService.dump()));
}

/**
 * Inserts debugger statements into the code based off the breakpoints set by the user.
 *
 * For every breakpoint, a corresponding `debugger;` statement is inserted at the start
 * of the line that the breakpoint is placed at. The `debugger;` statement is available
 * in both JavaScript and Source, and invokes any available debugging functionality.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
 * for more information.
 *
 * While it is typically the case that statements are contained within a single line,
 * this is not necessarily true. For example, the code `const x = 3;` can be rewritten as:
 * ```
 * const x
 * = 3;
 * ```
 * A breakpoint on the line `= 3;` would thus result in a `debugger;` statement being
 * added in the middle of another statement. The resulting code would then be syntactically
 * invalid.
 *
 * To work around this issue, we parse the code to check for syntax errors whenever we
 * add a `debugger;` statement. If the addition of a `debugger;` statement results in
 * invalid code, an error message is outputted with the line number of the offending
 * breakpoint.
 *
 * @param workspaceLocation The location of the current workspace.
 * @param code              The code which debugger statements should be inserted into.
 * @param breakpoints       The breakpoints corresponding to the code.
 * @param context           The context in which the code should be evaluated in.
 */
function* insertDebuggerStatements(
  workspaceLocation: WorkspaceLocation,
  code: string,
  breakpoints: string[],
  context: Context
): Generator<StrictEffect, string, any> {
  // Check for initial syntax errors.
  if (isSourceLanguage(context.chapter)) {
    parse(code, context);
  }

  // If there are syntax errors, we do not insert the debugger statements.
  // Instead, we let the code be evaluated so that the error messages are printed.
  if (context.errors.length > 0) {
    context.errors = [];
    return code;
  }

  // Otherwise, we step through the breakpoints one by one & try to insert
  // corresponding debugger statements.
  const lines = code.split('\n');
  let transformedCode = code;
  for (const breakpoint in breakpoints) {
    // Add a debugger statement to the line with the breakpoint.
    const breakpointLineNum: number = parseInt(breakpoint);
    lines[breakpointLineNum] = 'debugger;' + lines[breakpointLineNum];
    // Reconstruct the code & check that the code is still syntactically valid.
    // The insertion of the debugger statement is potentially invalid if it
    // happens within an existing statement (that is split across lines).
    transformedCode = lines.join('\n');
    if (isSourceLanguage(context.chapter)) {
      parse(transformedCode, context);
    }
    // If the resulting code is no longer syntactically valid, throw an error.
    if (context.errors.length > 0) {
      const errorMessage = `Hint: Misplaced breakpoint at line ${breakpointLineNum + 1}.`;
      yield put(actions.sendReplInputToOutput(errorMessage, workspaceLocation));
      return code;
    }
  }

  // Finally, return the transformed code with debugger statements added.
  return transformedCode;
}

export function* evalEditor(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  const [prepend, activeEditorTabIndex, editorTabs, execTime, fileSystem, remoteExecutionSession]: [
    string,
    number | null,
    EditorTabState[],
    number,
    FSModule,
    DeviceSession | undefined
  ] = yield select((state: OverallState) => [
    state.workspaces[workspaceLocation].programPrependValue,
    state.workspaces[workspaceLocation].activeEditorTabIndex,
    state.workspaces[workspaceLocation].editorTabs,
    state.workspaces[workspaceLocation].execTime,
    state.fileSystem.inBrowserFileSystem,
    state.session.remoteExecutionSession
  ]);

  if (activeEditorTabIndex === null) {
    // TODO: Implement this.
    throw new Error('To be handled...');
  }

  const defaultFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.js`;
  let files: Record<string, string>;
  // A workspace without a base path in the file system is one which has not been
  // refactored to work with Folder mode.
  if (WORKSPACE_BASE_PATHS[workspaceLocation] === '') {
    files = {
      [defaultFilePath]: editorTabs[activeEditorTabIndex].value
    };
  } else {
    files = yield call(retrieveFilesInWorkspaceAsRecord, workspaceLocation, fileSystem);
  }
  const entrypointFilePath = editorTabs[activeEditorTabIndex].filePath ?? defaultFilePath;

  yield put(actions.addEvent([EventType.RUN_CODE]));

  if (remoteExecutionSession && remoteExecutionSession.workspace === workspaceLocation) {
    yield put(actions.remoteExecRun(files, entrypointFilePath));
  } else {
    // End any code that is running right now.
    yield put(actions.beginInterruptExecution(workspaceLocation));
    const entrypointCode = files[entrypointFilePath];
    yield* clearContext(workspaceLocation, entrypointCode);
    yield put(actions.clearReplOutput(workspaceLocation));
    const context = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].context
    );

    // Insert debugger statements at the lines of the program with a breakpoint.
    for (const editorTab of editorTabs) {
      const filePath = editorTab.filePath ?? defaultFilePath;
      const code = editorTab.value;
      const breakpoints = editorTab.breakpoints;
      files[filePath] = yield* insertDebuggerStatements(
        workspaceLocation,
        code,
        breakpoints,
        context
      );
    }

    // Evaluate the prepend silently with a privileged context, if it exists
    if (prepend.length) {
      const elevatedContext = makeElevatedContext(context);
      yield call(evalCode, prepend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
      // Block use of methods from privileged context
      yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation);
    }

    yield call(evalCode, entrypointCode, context, execTime, workspaceLocation, EVAL_EDITOR);
  }
}

export function* runTestCase(
  workspaceLocation: WorkspaceLocation,
  index: number
): Generator<StrictEffect, boolean, any> {
  const [prepend, value, postpend, testcase]: [string, string, string, string] = yield select(
    (state: OverallState) => {
      const prepend = state.workspaces[workspaceLocation].programPrependValue;
      const postpend = state.workspaces[workspaceLocation].programPostpendValue;
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      const value = state.workspaces[workspaceLocation].editorTabs[0].value;
      const testcase = state.workspaces[workspaceLocation].editorTestcases[index].program;
      return [prepend, value, postpend, testcase] as [string, string, string, string];
    }
  );
  const type: TestcaseType = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].editorTestcases[index].type
  );
  const execTime: number = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].execTime
  );

  yield* clearContext(workspaceLocation, value);

  // Do NOT clear the REPL output!

  /**
   *  Shard a new privileged context elevated to use Source chapter 4 for testcases - enables
   *  grader programs in postpend to run as expected without raising interpreter errors
   *  But, do not persist this context to the workspace state - this prevent students from using
   *  this elevated context to run dis-allowed code beyond the current chapter from the REPL
   */
  const context: Context<any> = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].context
  );

  // Execute prepend silently in privileged context
  const elevatedContext = makeElevatedContext(context);
  yield call(evalCode, prepend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);

  // Block use of methods from privileged context using a randomly generated blocking key
  // Then execute student program silently in the original workspace context
  const blockKey = String(random(1048576, 68719476736));
  yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  yield call(evalCode, value, context, execTime, workspaceLocation, EVAL_SILENT);

  // Halt execution if the student's code in the editor results in an error
  if (context.errors.length) {
    yield put(actions.evalTestcaseFailure(context.errors, workspaceLocation, index));
    return false;
  }

  // Execute postpend silently back in privileged context, if it exists
  if (postpend) {
    // TODO: consider doing a swap. If the user has modified any of the variables,
    // i.e. reusing any of the "reserved" names, prevent it from being accessed in the REPL.
    yield* restoreExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
    yield call(evalCode, postpend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
    yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  }
  // Finally execute the testcase function call in the privileged context
  yield* evalTestCode(testcase, elevatedContext, execTime, workspaceLocation, index, type);
  return true;
}

export function* blockExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  unblockKey?: string
) {
  // Extract additional methods available in the elevated context relative to the context
  const toBeBlocked = getDifferenceInMethods(elevatedContext, context);
  if (unblockKey) {
    const storeValues = getStoreExtraMethodsString(toBeBlocked, unblockKey);
    yield call(evalCode, storeValues, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
  }

  const nullifier = getBlockExtraMethodsString(toBeBlocked);
  yield call(evalCode, nullifier, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
}

export function* restoreExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  unblockKey: string
) {
  const toUnblock = getDifferenceInMethods(elevatedContext, context);
  const restorer = getRestoreExtraMethodsString(toUnblock, unblockKey);
  yield call(evalCode, restorer, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
}

export function* evalCode(
  code: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  actionType: string
): SagaIterator {
  context.runtime.debuggerOn =
    (actionType === EVAL_EDITOR || actionType === DEBUG_RESUME) && context.chapter > 2;

  // Logic for execution of substitution model visualizer
  const correctWorkspace = workspaceLocation === 'playground' || workspaceLocation === 'sicp';
  const substIsActive: boolean = correctWorkspace
    ? yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
            .usingSubst
      )
    : false;
  const stepLimit: number = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].stepLimit
  );
  const substActiveAndCorrectChapter = context.chapter <= 2 && substIsActive;
  if (substActiveAndCorrectChapter) {
    context.executionMethod = 'interpreter';
    // icon to blink
    const icon = document.getElementById(SideContentType.substVisualizer + '-icon');
    if (icon) {
      icon.classList.add('side-content-tab-alert');
    }
  }

  function call_variant(variant: Variant) {
    if (variant === Variant.NON_DET) {
      return code.trim() === TRY_AGAIN
        ? call(resume, lastNonDetResult)
        : call(runInContext, code, context, {
            executionMethod: 'interpreter',
            originalMaxExecTime: execTime,
            stepLimit: stepLimit,
            useSubst: substActiveAndCorrectChapter
          });
    } else if (variant === Variant.LAZY) {
      return call(runInContext, code, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: execTime,
        stepLimit: stepLimit,
        useSubst: substActiveAndCorrectChapter
      });
    } else if (variant === Variant.WASM) {
      return call(wasm_compile_and_run, code, context, actionType === EVAL_REPL);
    } else {
      throw new Error('Unknown variant: ' + variant);
    }
  }
  async function wasm_compile_and_run(
    wasmCode: string,
    wasmContext: Context,
    isRepl: boolean
  ): Promise<Result> {
    return Sourceror.compile(wasmCode, wasmContext, isRepl)
      .then((wasmModule: WebAssembly.Module) => {
        const transcoder = new Sourceror.Transcoder();
        return Sourceror.run(
          wasmModule,
          Sourceror.makePlatformImports(makeSourcerorExternalBuiltins(wasmContext), transcoder),
          transcoder,
          wasmContext,
          isRepl
        );
      })
      .then(
        (returnedValue: any): Result => ({ status: 'finished', context, value: returnedValue }),
        (e: any): Result => {
          console.log(e);
          return { status: 'error' };
        }
      );
  }

  const isNonDet: boolean = context.variant === Variant.NON_DET;
  const isLazy: boolean = context.variant === Variant.LAZY;
  const isWasm: boolean = context.variant === Variant.WASM;

  // Handles `console.log` statements in fullJS
  const detachConsole: () => void =
    context.chapter === Chapter.FULL_JS
      ? DisplayBufferService.attachConsole(workspaceLocation)
      : () => {};

  const { result, interrupted, paused } = yield race({
    result:
      actionType === DEBUG_RESUME
        ? call(resume, lastDebuggerResult)
        : isNonDet || isLazy || isWasm
        ? call_variant(context.variant)
        : call(runInContext, code, context, {
            scheduler: 'preemptive',
            originalMaxExecTime: execTime,
            stepLimit: stepLimit,
            throwInfiniteLoops: true,
            useSubst: substActiveAndCorrectChapter
          }),

    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(BEGIN_INTERRUPT_EXECUTION),
    paused: take(BEGIN_DEBUG_PAUSE)
  });

  detachConsole();

  if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.debuggerReset(workspaceLocation));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, 'Execution aborted', 750);
    return;
  }

  if (paused) {
    yield put(actions.endDebuggerPause(workspaceLocation));
    lastDebuggerResult = manualToggleDebugger(context);
    yield call(updateInspector, workspaceLocation);
    yield call(showWarningMessage, 'Execution paused', 750);
    return;
  }

  if (actionType === EVAL_EDITOR) {
    lastDebuggerResult = result;
  }
  yield call(updateInspector, workspaceLocation);

  if (
    result.status !== 'suspended' &&
    result.status !== 'finished' &&
    result.status !== 'suspended-non-det' &&
    result.status !== 'suspended-ec-eval'
  ) {
    yield* dumpDisplayBuffer(workspaceLocation);
    yield put(actions.evalInterpreterError(context.errors, workspaceLocation));

    // we need to parse again, but preserve the errors in context
    const oldErrors = context.errors;
    context.errors = [];
    const parsed = parse(code, context);
    const typeErrors = parsed && typeCheck(validateAndAnnotate(parsed!, context), context)[1];
    context.errors = oldErrors;
    // for achievement event tracking
    const events = context.errors.length > 0 ? [EventType.ERROR] : [];

    if (typeErrors && typeErrors.length > 0) {
      events.push(EventType.ERROR);
      yield put(
        actions.sendReplInputToOutput('Hints:\n' + parseError(typeErrors), workspaceLocation)
      );
    }
    yield put(actions.addEvent(events));
    return;
  } else if (result.status === 'suspended' || result.status === 'suspended-ec-eval') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  } else if (isNonDet) {
    if (result.value === 'cut') {
      result.value = undefined;
    }
    lastNonDetResult = result;
  }

  yield* dumpDisplayBuffer(workspaceLocation);

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
  }

  // For EVAL_EDITOR and EVAL_REPL, we send notification to workspace that a program has been evaluated
  if (actionType === EVAL_EDITOR || actionType === EVAL_REPL) {
    if (context.errors.length > 0) {
      yield put(actions.addEvent([EventType.ERROR]));
    }
    yield put(notifyProgramEvaluated(result, lastDebuggerResult, code, context, workspaceLocation));
  }
}

export function* evalTestCode(
  code: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  index: number,
  type: TestcaseType
) {
  yield put(actions.resetTestcase(workspaceLocation, index));
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, {
      scheduler: 'preemptive',
      originalMaxExecTime: execTime,
      throwInfiniteLoops: true
    }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(BEGIN_INTERRUPT_EXECUTION)
  });

  if (interrupted) {
    interrupt(context);
    yield* dumpDisplayBuffer(workspaceLocation);
    // Redundancy, added ensure that interruption results in an error.
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, `Execution of testcase ${index} aborted`, 750);
    return;
  }

  yield* dumpDisplayBuffer(workspaceLocation);
  /** result.status here is either 'error' or 'finished'; 'suspended' is not possible
   *  since debugger is presently disabled in assessment and grading environments
   */
  if (result.status === 'error') {
    yield put(actions.evalInterpreterError(context.errors, workspaceLocation));
    yield put(actions.evalTestcaseFailure(context.errors, workspaceLocation, index));
  } else if (result.status === 'finished') {
    // Execution of the testcase is successful, i.e. no errors were raised
    yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
    yield put(actions.evalTestcaseSuccess(result.value, workspaceLocation, index));
  }

  // If a opaque testcase was executed, remove its output from the REPL
  if (type === TestcaseTypes.opaque) {
    yield put(actions.clearReplOutputLast(workspaceLocation));
  }
}
