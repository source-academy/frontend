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
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { parse } from 'js-slang/dist/parser/parser';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { typeCheck } from 'js-slang/dist/typeChecker/typeChecker';
import { Variant } from 'js-slang/dist/types';
import { validateAndAnnotate } from 'js-slang/dist/validator/validator';
import { random } from 'lodash';
import { SagaIterator } from 'redux-saga';
import { call, delay, put, race, select, take, takeEvery } from 'redux-saga/effects';
import * as Sourceror from 'sourceror-driver';

import * as actions from '../../actions'; // TODO: Fix
import { PlaygroundState } from '../../features/playground/PlaygroundTypes';
import { OverallState, styliseChapter } from '../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryNames } from '../application/types/ExternalTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS,
  HIGHLIGHT_LINE
} from '../application/types/InterpreterTypes';
import { Testcase, TestcaseType, TestcaseTypes } from '../assessment/AssessmentTypes';
import { INVALID_EDITOR_SESSION_ID } from '../collabEditing/CollabEditingTypes';
import { Documentation } from '../documentation/Documentation';
import { SideContentType } from '../sideContent/SideContentTypes';
import {
  getBlockExtraMethodsString,
  getDifferenceInMethods,
  getRestoreExtraMethodsString,
  getStoreExtraMethodsString,
  highlightLine,
  inspectorUpdate,
  makeElevatedContext,
  visualiseEnv
} from '../utils/JsSlangHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import {
  BEGIN_CLEAR_CONTEXT,
  CHAPTER_SELECT,
  ENSURE_LIBRARIES_LOADED,
  EVAL_EDITOR,
  EVAL_REPL,
  EVAL_SILENT,
  EVAL_TESTCASE,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  PROMPT_AUTOCOMPLETE,
  TOGGLE_EDITOR_AUTORUN,
  UPDATE_EDITOR_BREAKPOINTS,
  WorkspaceLocation,
  WorkspaceLocations
} from '../workspace/WorkspaceTypes';
import { WorkspaceState } from '../workspace/WorkspaceTypes';

let breakpoints: string[] = [];
export default function* WorkspaceSaga(): SagaIterator {
  let context: Context;

  yield takeEvery(EVAL_EDITOR, function*(action: ReturnType<typeof actions.evalEditor>) {
    const workspaceLocation = action.payload.workspaceLocation;
    const code: string = yield select((state: OverallState) => {
      const prependCode = (state.workspaces[workspaceLocation] as WorkspaceState).editorPrepend;
      const editorCode = (state.workspaces[workspaceLocation] as WorkspaceState).editorValue!;
      return [prependCode, editorCode] as [string, string];
    });
    const [prepend, tempvalue] = code;
    const exploded = tempvalue.split('\n');
    for (const i in breakpoints) {
      if (typeof i === 'string') {
        const index: number = +i;
        exploded[index] = 'debugger;' + exploded[index];
      }
    }
    const value = exploded.join('\n');
    const chapter: number = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.chapter
    );
    const execTime: number = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).execTime
    );
    const symbols: string[] = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).globals
    );
    const variant: Variant = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.variant
    );
    const library = {
      chapter,
      variant,
      external: {
        name: ExternalLibraryNames.NONE,
        symbols
      },
      globals
    };
    // End any code that is running right now.
    yield put(actions.beginInterruptExecution(workspaceLocation));
    // Clear the context, with the same chapter and externalSymbols as before.
    yield put(actions.beginClearContext(library, workspaceLocation));
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );

    // Evaluate the prepend silently with a privileged context, if it exists
    if (prepend.length) {
      const elevatedContext = makeElevatedContext(context);
      yield* evalCode(prepend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
      // Block use of methods from privileged context
      yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation);
    }

    yield* evalCode(value, context, execTime, workspaceLocation, EVAL_EDITOR);
    yield put(notifyProgramEvaluated(lastDebuggerResult, code, context, workspaceLocation));
  });

  yield takeEvery(PROMPT_AUTOCOMPLETE, function*(
    action: ReturnType<typeof actions.promptAutocomplete>
  ) {
    const workspaceLocation = action.payload.workspaceLocation;

    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );

    const code: string = yield select((state: OverallState) => {
      const prependCode = (state.workspaces[workspaceLocation] as WorkspaceState).editorPrepend;
      const editorCode = (state.workspaces[workspaceLocation] as WorkspaceState).editorValue!;
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

    const editorSuggestions = editorNames.map((name: any) => ({
      caption: name.name,
      value: name.name,
      meta: name.meta,
      score: name.score ? name.score + 1000 : 1000 // Prioritize suggestions from code
    }));

    let chapterName = context.chapter.toString();
    if (context.variant !== 'default') {
      chapterName += '_' + context.variant;
    }

    const builtinSuggestions = Documentation.builtins[chapterName] || [];

    const extLib = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).externalLibrary
    );

    const extLibSuggestions = Documentation.externalLibraries[extLib] || [];

    yield call(
      action.payload.callback,
      null,
      editorSuggestions.concat(builtinSuggestions, extLibSuggestions)
    );
  });

  yield takeEvery(TOGGLE_EDITOR_AUTORUN, function*(
    action: ReturnType<typeof actions.toggleEditorAutorun>
  ) {
    const workspaceLocation = action.payload.workspaceLocation;
    const isEditorAutorun = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).isEditorAutorun
    );
    yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
  });

  yield takeEvery(INVALID_EDITOR_SESSION_ID, function*(
    action: ReturnType<typeof actions.invalidEditorSessionId>
  ) {
    yield call(showWarningMessage, 'Invalid ID Input', 1000);
  });

  yield takeEvery(EVAL_REPL, function*(action: ReturnType<typeof actions.evalRepl>) {
    const workspaceLocation = action.payload.workspaceLocation;
    const code: string = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).replValue
    );
    const execTime: number = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).execTime
    );
    yield put(actions.beginInterruptExecution(workspaceLocation));
    yield put(actions.clearReplInput(workspaceLocation));
    yield put(actions.sendReplInputToOutput(code, workspaceLocation));
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );
    yield* evalCode(code, context, execTime, workspaceLocation, EVAL_REPL);
    yield put(notifyProgramEvaluated(lastDebuggerResult, code, context, workspaceLocation));
  });

  yield takeEvery(DEBUG_RESUME, function*(action: ReturnType<typeof actions.debuggerResume>) {
    const workspaceLocation = action.payload.workspaceLocation;
    const code: string = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).editorValue
    );
    const execTime: number = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).execTime
    );
    yield put(actions.beginInterruptExecution(workspaceLocation));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );
    yield put(actions.highlightEditorLine([], workspaceLocation));
    yield* evalCode(code, context, execTime, workspaceLocation, DEBUG_RESUME);
  });

  yield takeEvery(DEBUG_RESET, function*(action: ReturnType<typeof actions.debuggerReset>) {
    const workspaceLocation = action.payload.workspaceLocation;
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );
    yield put(actions.clearReplOutput(workspaceLocation));
    inspectorUpdate(undefined);
    highlightLine(undefined);
    yield put(actions.clearReplOutput(workspaceLocation));
    context.runtime.break = false;
    lastDebuggerResult = undefined;
  });

  yield takeEvery(HIGHLIGHT_LINE, function*(
    action: ReturnType<typeof actions.highlightEditorLine>
  ) {
    const workspaceLocation = action.payload.highlightedLines;
    highlightLine(workspaceLocation[0]);
    yield;
  });

  yield takeEvery(UPDATE_EDITOR_BREAKPOINTS, function*(
    action: ReturnType<typeof actions.setEditorBreakpoint>
  ) {
    breakpoints = action.payload.breakpoints;
    yield;
  });

  yield takeEvery(EVAL_TESTCASE, function*(action: ReturnType<typeof actions.evalTestcase>) {
    const workspaceLocation = action.payload.workspaceLocation;
    const index = action.payload.testcaseId;
    const code: string = yield select((state: OverallState) => {
      // tslint:disable: no-shadowed-variable
      const prepend = (state.workspaces[workspaceLocation] as WorkspaceState).editorPrepend;
      const value = (state.workspaces[workspaceLocation] as WorkspaceState).editorValue!;
      const postpend = (state.workspaces[workspaceLocation] as WorkspaceState).editorPostpend;
      const testcase = (state.workspaces[workspaceLocation] as WorkspaceState).editorTestcases[
        index
      ].program;
      return [prepend, value, postpend, testcase] as [string, string, string, string];
      // tslint:enable: no-shadowed-variable
    });
    const [prepend, value, postpend, testcase] = code;
    const type: TestcaseType = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).editorTestcases[index].type
    );
    const execTime: number = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).execTime
    );

    // Do not interrupt execution of other testcases (potential race condition)
    // No need to clear the context, since a shard context will be used for testcase execution
    // Do NOT clear the REPL output!

    /**
     *  Shard a new privileged context elevated to use Source chapter 4 for testcases - enables
     *  grader programs in postpend to run as expected without raising interpreter errors
     *  But, do not persist this context to the workspace state - this prevent students from using
     *  this elevated context to run dis-allowed code beyond the current chapter from the REPL
     */
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );

    // Execute prepend silently in privileged context
    const elevatedContext = makeElevatedContext(context);
    yield* evalCode(prepend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);

    // Block use of methods from privileged context using a randomly generated blocking key
    // Then execute student program silently in the original workspace context
    const blockKey = String(random(1048576, 68719476736));
    yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
    yield* evalCode(value, context, execTime, workspaceLocation, EVAL_SILENT);

    // Halt execution if the student's code in the editor results in an error
    if (context.errors.length) {
      return;
    }

    // Execute postpend silently back in privileged context, if it exists
    if (postpend) {
      // TODO: consider doing a swap. If the user has modified any of the variables,
      // i.e. reusing any of the "reserved" names, prevent it from being accessed in the REPL.
      yield* restoreExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
      yield* evalCode(postpend, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
      yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
    }
    // Finally execute the testcase function call in the privileged context
    yield* evalTestCode(testcase, elevatedContext, execTime, workspaceLocation, index, type);
  });

  yield takeEvery(CHAPTER_SELECT, function*(action: ReturnType<typeof actions.chapterSelect>) {
    const workspaceLocation = action.payload.workspaceLocation;
    const newChapter = action.payload.chapter;
    const oldVariant = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.variant
    );
    const newVariant = action.payload.variant;
    const oldChapter = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.chapter
    );

    const symbols: string[] = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).globals
    );
    if (newChapter !== oldChapter || newVariant !== oldVariant) {
      const library = {
        chapter: newChapter,
        variant: newVariant,
        external: {
          name: ExternalLibraryNames.NONE,
          symbols
        },
        globals
      };
      yield put(actions.beginClearContext(library, workspaceLocation));
      yield put(actions.clearReplOutput(workspaceLocation));
      yield put(actions.debuggerReset(workspaceLocation));
      yield call(showSuccessMessage, `Switched to ${styliseChapter(newChapter, newVariant)}`, 1000);
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
  yield takeEvery(PLAYGROUND_EXTERNAL_SELECT, function*(
    action: ReturnType<typeof actions.externalLibrarySelect>
  ) {
    const workspaceLocation = action.payload.workspaceLocation;
    const chapter = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).context.chapter
    );
    const globals: Array<[string, any]> = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).globals
    );
    const newExternalLibraryName = action.payload.externalLibraryName;
    const oldExternalLibraryName = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].externalLibrary
    );
    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };
    if (newExternalLibraryName !== oldExternalLibraryName) {
      yield put(actions.changeExternalLibrary(newExternalLibraryName, workspaceLocation));
      yield put(actions.beginClearContext(library, workspaceLocation));
      yield put(actions.clearReplOutput(workspaceLocation));
      yield call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000);
    }
  });

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
   * Makes a call to checkWebGLAvailable to ensure that the Graphics libraries are loaded.
   * To abstract this to other libraries, add a call to the all() effect.
   */
  yield takeEvery(ENSURE_LIBRARIES_LOADED, function*(
    action: ReturnType<typeof actions.ensureLibrariesLoaded>
  ) {
    yield* checkWebGLAvailable();
  });

  /**
   * Handles the side effect of resetting the WebGL context when context is reset.
   *
   * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
   * the function.
   */
  yield takeEvery(BEGIN_CLEAR_CONTEXT, function*(
    action: ReturnType<typeof actions.beginClearContext>
  ) {
    yield* checkWebGLAvailable();
    const externalLibraryName = action.payload.library.external.name;
    switch (externalLibraryName) {
      case ExternalLibraryNames.RUNES:
        (window as any).loadLib('RUNES');
        (window as any).getReadyWebGLForCanvas('3d');
        break;
      case ExternalLibraryNames.CURVES:
        (window as any).loadLib('CURVES');
        (window as any).getReadyWebGLForCanvas('curve');
        break;
      case ExternalLibraryNames.MACHINELEARNING:
        (window as any).loadLib('MACHINELEARNING');
        break;
    }
    const globals: Array<[string, any]> = action.payload.library.globals as Array<[string, any]>;
    for (const [key, value] of globals) {
      window[key] = value;
    }
    yield put(actions.endClearContext(action.payload.library, action.payload.workspaceLocation));
    yield undefined;
  });

  yield takeEvery(NAV_DECLARATION, function*(
    action: ReturnType<typeof actions.navigateToDeclaration>
  ) {
    const workspaceLocation = action.payload.workspaceLocation;
    const code: string = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).editorValue
    );
    context = yield select(
      (state: OverallState) => (state.workspaces[workspaceLocation] as WorkspaceState).context
    );

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
  });
}

let lastDebuggerResult: any;
let lastNonDetResult: Result;
function* updateInspector(workspaceLocation: WorkspaceLocation) {
  try {
    const start = lastDebuggerResult.context.runtime.nodes[0].loc.start.line - 1;
    const end = lastDebuggerResult.context.runtime.nodes[0].loc.end.line - 1;
    yield put(actions.highlightEditorLine([start, end], workspaceLocation));
    inspectorUpdate(lastDebuggerResult);
    visualiseEnv(lastDebuggerResult);
  } catch (e) {
    put(actions.highlightEditorLine([], workspaceLocation));
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
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
    yield* evalCode(storeValues, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
  }

  const nullifier = getBlockExtraMethodsString(toBeBlocked);
  yield* evalCode(nullifier, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
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
  yield* evalCode(restorer, elevatedContext, execTime, workspaceLocation, EVAL_SILENT);
}

export function* evalCode(
  code: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  actionType: string
) {
  context.runtime.debuggerOn =
    (actionType === EVAL_EDITOR || actionType === DEBUG_RESUME) && context.chapter > 2;
  if (!context.runtime.debuggerOn && context.chapter > 2 && actionType !== EVAL_SILENT) {
    // Interface not guaranteed to exist, e.g. mission editor.
    inspectorUpdate(undefined); // effectively resets the interface
  }

  // Logic for execution of substitution model visualiser
  const substIsActive: boolean = yield select(
    (state: OverallState) => (state.playground as PlaygroundState).usingSubst
  );
  const substActiveAndCorrectChapter =
    context.chapter <= 2 && workspaceLocation === WorkspaceLocations.playground && substIsActive;
  if (substActiveAndCorrectChapter) {
    context.executionMethod = 'interpreter';
    // icon to blink
    const icon = document.getElementById(SideContentType.substVisualizer + '-icon');
    if (icon) {
      icon.classList.add('side-content-tab-alert');
    }
  }

  function call_variant(variant: Variant) {
    if (variant === 'non-det') {
      return code.trim() === TRY_AGAIN
        ? call(resume, lastNonDetResult)
        : call(runInContext, code, context, {
            executionMethod: 'interpreter',
            originalMaxExecTime: execTime,
            useSubst: substActiveAndCorrectChapter
          });
    } else if (variant === 'lazy') {
      return call(runInContext, code, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: execTime,
        useSubst: substActiveAndCorrectChapter
      });
    } else if (variant === 'wasm') {
      return call(wasm_compile_and_run, code, context);
    } else {
      throw new Error('Unknown variant: ' + variant);
    }
  }
  async function wasm_compile_and_run(wasmCode: string, wasmContext: Context): Promise<Result> {
    return Sourceror.compile(wasmCode, wasmContext)
      .then((wasmModule: WebAssembly.Module) => Sourceror.run(wasmModule, wasmContext))
      .then(
        (returnedValue: any) => ({ status: 'finished', context, value: returnedValue }),
        _ => ({ status: 'error' })
      );
  }

  const isNonDet: boolean = context.variant === 'non-det';
  const isLazy: boolean = context.variant === 'lazy';
  const isWasm: boolean = context.variant === 'wasm';
  const { result, interrupted, paused } = yield race({
    result:
      actionType === DEBUG_RESUME
        ? call(resume, lastDebuggerResult)
        : isNonDet || isLazy || isWasm
        ? call_variant(context.variant)
        : call(runInContext, code, context, {
            scheduler: 'preemptive',
            originalMaxExecTime: execTime,
            useSubst: substActiveAndCorrectChapter
          }),

    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(BEGIN_INTERRUPT_EXECUTION),
    paused: take(BEGIN_DEBUG_PAUSE)
  });

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
    yield updateInspector(workspaceLocation);
    yield call(showWarningMessage, 'Execution paused', 750);
    return;
  }

  if (actionType === EVAL_EDITOR) {
    lastDebuggerResult = result;
  }
  yield updateInspector(workspaceLocation);

  if (
    result.status !== 'suspended' &&
    result.status !== 'finished' &&
    result.status !== 'suspended-non-det'
  ) {
    yield put(actions.evalInterpreterError(context.errors, workspaceLocation));

    // we need to parse again, but preserve the errors in context
    const oldErrors = context.errors;
    context.errors = [];
    const parsed = parse(code, context);
    context.errors = oldErrors;
    const typeErrors = parsed && typeCheck(validateAndAnnotate(parsed!, context))[1];
    if (typeErrors && typeErrors.length > 0) {
      yield put(
        actions.sendReplInputToOutput('Hints:\n' + parseError(typeErrors), workspaceLocation)
      );
    }
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
  }

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
  }

  /** If successful, then continue to run all testcases IFF evalCode was triggered from
   *    EVAL_EDITOR (Run button) instead of EVAL_REPL (Eval button)
   *  Retrieve the index of the active side-content tab
   */
  if (actionType === EVAL_EDITOR) {
    const activeTab: SideContentType = yield select(
      (state: OverallState) =>
        (state.workspaces[workspaceLocation] as WorkspaceState).sideContentActiveTab
    );
    /** If a student is attempting an assessment and has the autograder tab open OR
     *    a grader is grading a submission and has the autograder tab open,
     *    RUN all testcases of the current question through the interpreter
     *  Each testcase runs in its own "sandbox" since the Context is cleared for each,
     *    so side-effects from one testcase don't affect others
     */
    if (
      activeTab === SideContentType.autograder &&
      (workspaceLocation === WorkspaceLocations.assessment ||
        workspaceLocation === WorkspaceLocations.grading)
    ) {
      const testcases: Testcase[] = yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as WorkspaceState).editorTestcases
      );
      // Avoid displaying message if there are no testcases
      if (testcases.length > 0) {
        // Display a message to the user
        yield call(showSuccessMessage, `Running all testcases!`, 750);
        for (const idx of testcases.keys()) {
          yield put(actions.evalTestcase(workspaceLocation, idx));
          /** Run testcases synchronously - this blocks the generator until result of current
           *  testcase is known and output to REPL; ensures that HANDLE_CONSOLE_LOG appends
           *  consoleLogs(from display(...) calls) to the correct testcase result
           */
          const { success, error } = yield race({
            success: take(EVAL_TESTCASE_SUCCESS),
            error: take(EVAL_TESTCASE_FAILURE)
          });
          // Prematurely terminate if execution of current testcase returns an error
          if (error || !success) {
            return;
          }
        }
      }
    }
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
      originalMaxExecTime: execTime
    }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(BEGIN_INTERRUPT_EXECUTION)
  });

  if (interrupted) {
    interrupt(context);
    // Redundancy, added ensure that interruption results in an error.
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, `Execution of testcase ${index} aborted`, 750);
    return;
  }

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

  // If a hidden testcase was executed, remove its output from the REPL
  if (type === TestcaseTypes.hidden) {
    yield put(actions.clearReplOutputLast(workspaceLocation));
  }
}
