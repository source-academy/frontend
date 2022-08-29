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
import { stringify } from 'js-slang/dist/utils/stringify';
import { validateAndAnnotate } from 'js-slang/dist/validator/validator';
import { random } from 'lodash';
import Phaser from 'phaser';
import { SagaIterator } from 'redux-saga';
import { call, delay, put, race, select, StrictEffect, take } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { EventType } from '../../features/achievement/AchievementTypes';
import DataVisualizer from '../../features/dataVisualizer/dataVisualizer';
import { DeviceSession } from '../../features/remoteExecution/RemoteExecutionTypes';
import { OverallState, styliseSublanguage } from '../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  HIGHLIGHT_LINE
} from '../application/types/InterpreterTypes';
import { Library, Testcase, TestcaseType, TestcaseTypes } from '../assessment/AssessmentTypes';
import { Documentation } from '../documentation/Documentation';
import { showFullJSDisclaimer } from '../fullJS/FullJSUtils';
import { SideContentType } from '../sideContent/SideContentTypes';
import { actions } from '../utils/ActionsHelper';
import DisplayBufferService from '../utils/DisplayBufferService';
import {
  getInfiniteLoopData,
  isPotentialInfiniteLoop,
  reportInfiniteLoopError,
  reportNonErrorProgram,
  reportPotentialInfiniteLoop
} from '../utils/InfiniteLoopReporter';
import {
  getBlockExtraMethodsString,
  getDifferenceInMethods,
  getRestoreExtraMethodsString,
  getStoreExtraMethodsString,
  highlightLine,
  makeElevatedContext,
  visualizeEnv
} from '../utils/JsSlangHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from '../utils/SourcerorHelper';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import {
  BEGIN_CLEAR_CONTEXT,
  CHAPTER_SELECT,
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
  UPDATE_EDITOR_BREAKPOINTS,
  WorkspaceLocation
} from '../workspace/WorkspaceTypes';
import { safeTakeEvery as takeEvery, safeTakeLeading as takeLeading } from './SafeEffects';

let breakpoints: string[] = [];
export default function* WorkspaceSaga(): SagaIterator {
  let context: Context;

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
        const prependCode = state.workspaces[workspaceLocation].editorPrepend;
        const editorCode = state.workspaces[workspaceLocation].editorValue!;
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
      (state: OverallState) => state.workspaces[workspaceLocation].editorValue
    );
    const execTime: number = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].execTime
    );
    yield put(actions.beginInterruptExecution(workspaceLocation));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    yield put(actions.highlightEditorLine([], workspaceLocation));
    yield call(evalCode, code, context, execTime, workspaceLocation, DEBUG_RESUME);
  });

  yield takeEvery(DEBUG_RESET, function* (action: ReturnType<typeof actions.debuggerReset>) {
    const workspaceLocation = action.payload.workspaceLocation;
    context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);
    yield put(actions.clearReplOutput(workspaceLocation));
    highlightLine(undefined);
    yield put(actions.clearReplOutput(workspaceLocation));
    context.runtime.break = false;
    lastDebuggerResult = undefined;
  });

  yield takeEvery(
    HIGHLIGHT_LINE,
    function* (action: ReturnType<typeof actions.highlightEditorLine>) {
      const workspaceLocation = action.payload.highlightedLines;
      highlightLine(workspaceLocation[0]);
      yield;
    }
  );

  yield takeEvery(
    UPDATE_EDITOR_BREAKPOINTS,
    function* (action: ReturnType<typeof actions.setEditorBreakpoint>) {
      breakpoints = action.payload.breakpoints;
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
   * Ensures that the external JS libraries have been loaded by waiting
   * with a timeout. An error message will be shown
   * if the libraries are not loaded. This is particularly useful
   * when dealing with external library pre-conditions, e.g when the
   * website has just loaded and there is a need to reset the js-slang context,
   * but it cannot be determined if the global JS files are loaded yet.
   *
   * The presence of JS libraries are checked using the presence of a global
   * function "getReadyWebGLForCanvas", that is used in CLEAR_CONTEXT to prepare
   * the canvas for rendering in a specific mode.
   *
   * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
   * the function.
   *
   * @returns true if the libraries are loaded before timeout
   * @returns false if the loading of the libraries times out
   */
  function* checkWebGLAvailable() {
    function* helper() {
      while (true) {
        if ((window as any).getReadyWebGLForCanvas !== undefined) {
          break;
        }
        yield delay(250);
      }
      return true;
    }
    // Create a race condition between the js files being loaded and a timeout.
    const { loadedScripts, timeout } = yield race({
      loadedScripts: call(helper),
      timeout: delay(4000)
    });
    if (timeout !== undefined && loadedScripts === undefined) {
      yield call(showWarningMessage, 'Error loading libraries', 750);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Handles the side effect of resetting the WebGL context when context is reset.
   *
   * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
   * the function.
   */
  yield takeEvery(
    BEGIN_CLEAR_CONTEXT,
    function* (action: ReturnType<typeof actions.beginClearContext>) {
      yield* checkWebGLAvailable();
      if (action.payload.shouldInitLibrary) {
        const externalLibraryName = action.payload.library.external.name;
        switch (externalLibraryName) {
          case ExternalLibraryName.RUNES:
            (window as any).loadLib('RUNES');
            (window as any).getReadyWebGLForCanvas('3d');
            (window as any).getReadyStringifyForRunes(stringify);
            break;
          case ExternalLibraryName.MACHINELEARNING:
            (window as any).loadLib('MACHINELEARNING');
            break;
        }
      }
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
        (state: OverallState) => state.workspaces[workspaceLocation].editorValue
      );
      context = yield select((state: OverallState) => state.workspaces[workspaceLocation].context);

      const result = findDeclaration(code, context, {
        line: action.payload.cursorPosition.row + 1,
        column: action.payload.cursorPosition.column
      });
      if (result) {
        yield put(
          actions.moveCursor(action.payload.workspaceLocation, {
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
    yield put(actions.highlightEditorLine([start, end], workspaceLocation));
    visualizeEnv(lastDebuggerResult);
  } catch (e) {
    yield put(actions.highlightEditorLine([], workspaceLocation));
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
}

function* clearContext(workspaceLocation: WorkspaceLocation, program: string) {
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
  defineSymbol(context, '__PROGRAM__', program);
}

export function* dumpDisplayBuffer(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  yield put(actions.handleConsoleLog(workspaceLocation, ...DisplayBufferService.dump()));
}

export function* evalEditor(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  const [prepend, editorCode, execTime, remoteExecutionSession]: [
    string,
    string,
    number,
    DeviceSession | undefined
  ] = yield select((state: OverallState) => [
    state.workspaces[workspaceLocation].editorPrepend,
    state.workspaces[workspaceLocation].editorValue!,
    state.workspaces[workspaceLocation].execTime,
    state.session.remoteExecutionSession
  ]);

  yield put(actions.addEvent([EventType.RUN_CODE]));

  if (remoteExecutionSession && remoteExecutionSession.workspace === workspaceLocation) {
    yield put(actions.remoteExecRun(editorCode));
  } else {
    // End any code that is running right now.
    yield put(actions.beginInterruptExecution(workspaceLocation));
    yield* clearContext(workspaceLocation, editorCode);
    yield put(actions.clearReplOutput(workspaceLocation));
    const context = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].context
    );
    let value = editorCode;
    // Check for initial syntax errors. If there are errors, we continue with
    // eval and let it print the error messages.
    if (context.chapter !== Chapter.FULL_JS) {
      parse(value, context);
    }
    if (!context.errors.length) {
      // Otherwise we step through the breakpoints one by one and check them.
      const exploded = editorCode.split('\n');
      for (const b in breakpoints) {
        if (typeof b !== 'string') {
          continue;
        }

        const index: number = +b;
        context.errors = [];
        exploded[index] = 'debugger;' + exploded[index];
        value = exploded.join('\n');
        if (context.chapter !== Chapter.FULL_JS) {
          parse(value, context);
        }
        if (context.errors.length) {
          const msg = 'Hint: Misplaced breakpoint at line ' + (index + 1) + '.';
          yield put(actions.sendReplInputToOutput(msg, workspaceLocation));
        }
      }
    }

    // Evaluate the prepend silently with a privileged context, if it exists
    if (prepend.length) {
      const elevatedContext = makeElevatedContext(context);
      yield call(evalCode, prepend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
      // Block use of methods from privileged context
      yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation);
    }

    yield call(evalCode, value, context, execTime, workspaceLocation, EVAL_EDITOR);
  }
}

export function* runTestCase(
  workspaceLocation: WorkspaceLocation,
  index: number
): Generator<StrictEffect, boolean, any> {
  const [prepend, value, postpend, testcase]: [string, string, string, string] = yield select(
    (state: OverallState) => {
      const prepend = state.workspaces[workspaceLocation].editorPrepend;
      const value = state.workspaces[workspaceLocation].editorValue!;
      const postpend = state.workspaces[workspaceLocation].editorPostpend;
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
    result.status !== 'suspended-non-det'
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

    // report infinite loops but only for 'vanilla'/default source
    if (context.variant === undefined || context.variant === Variant.DEFAULT) {
      const [approval, sessionId] = yield select((state: OverallState) => [
        state.session.agreedToResearch,
        state.session.sessionId
      ]);
      if (approval) {
        const infiniteLoopData = getInfiniteLoopData(context);
        const lastError = context.errors[context.errors.length - 1];
        if (infiniteLoopData) {
          events.push(EventType.INFINITE_LOOP);
          yield put(actions.updateInfiniteLoopEncountered());
          yield call(reportInfiniteLoopError, sessionId, ...infiniteLoopData);
        } else if (isPotentialInfiniteLoop(lastError)) {
          events.push(EventType.INFINITE_LOOP);
          yield call(
            reportPotentialInfiniteLoop,
            sessionId,
            lastError.explain(),
            context.previousCode
          );
        }
      }
    }

    if (typeErrors && typeErrors.length > 0) {
      events.push(EventType.ERROR);
      yield put(
        actions.sendReplInputToOutput('Hints:\n' + parseError(typeErrors), workspaceLocation)
      );
    }
    yield put(actions.addEvent(events));
    return;
  } else if (result.status === 'suspended') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  } else if (isNonDet) {
    if (result.value === 'cut') {
      result.value = undefined;
    }
    lastNonDetResult = result;
  } else if (context.variant === undefined || context.variant === Variant.DEFAULT) {
    // Finished execution with no errors
    const [approval, sessionId, previousInfiniteLoop] = yield select((state: OverallState) => [
      state.session.agreedToResearch,
      state.session.sessionId,
      state.session.hadPreviousInfiniteLoop
    ]);
    if (approval && previousInfiniteLoop) {
      yield call(reportNonErrorProgram, sessionId, context.previousCode);
    }
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
