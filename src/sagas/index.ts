import { Context, interrupt, resume, runInContext, setBreakpointAtLine } from 'js-slang';
import { InterruptedError } from 'js-slang/dist/interpreter-errors';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { delay, SagaIterator } from 'redux-saga';
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { WorkspaceLocation } from '../actions/workspaces';
import { ExternalLibraryNames } from '../components/assessment/assessmentShape';
import { mockBackendSaga } from '../mocks/backend';
import { externalLibraries } from '../reducers/externalLibraries';
import { defaultEditorValue, IState, IWorkspaceState } from '../reducers/states';
import { LUMINUS_CLIENT_ID, USE_BACKEND } from '../utils/constants';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';
import { highlightLine, inspectorUpdate, visualiseEnv } from '../utils/slangHelper';
import backendSaga from './backend';

function* mainSaga() {
  yield* USE_BACKEND ? backendSaga() : mockBackendSaga();
  yield* workspaceSaga();
  yield* loginSaga();
  yield* playgroundSaga();
}

function* workspaceSaga(): SagaIterator {
  let context: Context;

  yield takeEvery(actionTypes.EVAL_EDITOR, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select(
      (state: IState) =>
        (state.workspaces[location] as IWorkspaceState).editorPrepend! +
        '\n' +
        (state.workspaces[location] as IWorkspaceState).editorValue! +
        '\n' +
        (state.workspaces[location] as IWorkspaceState).editorPostpend!
    );
    const chapter: number = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).globals
    );
    const library = {
      chapter,
      external: {
        name: ExternalLibraryNames.NONE,
        symbols
      },
      globals
    };
    /** End any code that is running right now. */
    yield put(actions.beginInterruptExecution(location));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.beginClearContext(library, location));
    yield put(actions.clearReplOutput(location));
    context = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context
    );
    yield* evalCode(code, context, location, actionTypes.EVAL_EDITOR);
  });

  yield takeEvery(actionTypes.TOGGLE_EDITOR_AUTORUN, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const isEditorAutorun = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).isEditorAutorun
    );
    yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
  });

  yield takeEvery(actionTypes.INVALID_EDITOR_SESSION_ID, function*(action) {
    yield call(showWarningMessage, 'Invalid ID Input', 1000);
  });

  yield takeEvery(actionTypes.EVAL_REPL, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).replValue
    );
    yield put(actions.beginInterruptExecution(location));
    yield put(actions.clearReplInput(location));
    yield put(actions.sendReplInputToOutput(code, location));
    context = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context
    );
    yield* evalCode(code, context, location, actionTypes.EVAL_REPL);
  });

  yield takeEvery(actionTypes.DEBUG_RESUME, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).editorValue
    );
    yield put(actions.beginInterruptExecution(location));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.clearReplOutput(location));
    context = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context
    );
    yield put(actions.highlightEditorLine([], location));
    yield* evalCode(code, context, location, actionTypes.DEBUG_RESUME);
  });

  yield takeEvery(actionTypes.DEBUG_RESET, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    context = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context
    );
    inspectorUpdate(undefined);
    highlightLine(0);
    yield put(actions.clearReplOutput(location));
    context.runtime.break = false;
    lastDebuggerResult = undefined;
  });

  yield takeEvery(actionTypes.HIGHLIGHT_LINE, function*(action) {
    const location = (action as actionTypes.IAction).payload.highlightedLines;
    highlightLine(location);
    yield;
  });

  yield takeEvery(actionTypes.UPDATE_EDITOR_BREAKPOINTS, function*(action) {
    setBreakpointAtLine((action as actionTypes.IAction).payload.breakpoints);
    yield;
  });

  yield takeEvery(actionTypes.EVAL_TESTCASE, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const index = (action as actionTypes.IAction).payload.testcaseId;
    const code: string = yield select(
      (state: IState) =>
        (state.workspaces[location] as IWorkspaceState).editorPrepend! +
        '\n' +
        (state.workspaces[location] as IWorkspaceState).editorValue! +
        '\n' +
        (state.workspaces[location] as IWorkspaceState).editorPostpend! +
        '\n' +
        (state.workspaces[location] as IWorkspaceState).editorTestcases[index].program!
    );
    const chapter: number = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).globals
    );
    const library = {
      chapter,
      external: {
        name: ExternalLibraryNames.NONE,
        symbols
      },
      globals
    };
    /** End any code that is running right now. */
    yield put(actions.beginInterruptExecution(location));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.beginClearContext(library, location));
    yield put(actions.clearReplOutput(location));
    context = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context
    );
    yield* evalTestCode(code, context, location, index);
  });

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const newChapter = (action as actionTypes.IAction).payload.chapter;
    const oldChapter = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).globals
    );
    if (newChapter !== oldChapter) {
      const library = {
        chapter: newChapter,
        external: {
          name: ExternalLibraryNames.NONE,
          symbols
        },
        globals
      };
      yield put(actions.beginClearContext(library, location));
      yield put(actions.clearReplOutput(location));
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000);
    }
  });

  /**
   * Note that the PLAYGROUND_EXTERNAL_SELECT action is made to
   * select the library for playground.
   * This is because assessments do not have a chapter & library select, the question
   * specifies the chapter and library to be used.
   *
   * To abstract this to assessments, the state structure must be manipulated to store
   * the external library name in a IWorkspaceState (as compared to IWorkspaceManagerState).
   *
   * @see IWorkspaceManagerState @see IWorkspaceState
   */
  yield takeEvery(actionTypes.PLAYGROUND_EXTERNAL_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation;
    const chapter = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).context.chapter
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[location] as IWorkspaceState).globals
    );
    const newExternalLibraryName = (action as actionTypes.IAction).payload.externalLibraryName;
    const oldExternalLibraryName = yield select(
      (state: IState) => state.workspaces.playground.playgroundExternal
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
      yield put(actions.changePlaygroundExternal(newExternalLibraryName));
      yield put(actions.beginClearContext(library, location));
      yield put(actions.clearReplOutput(location));
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
        yield call(delay, 250);
      }
      return true;
    }
    /** Create a race condition between the js files being loaded and a timeout. */
    const { loadedScripts, timeout } = yield race({
      loadedScripts: call(helper),
      timeout: call(delay, 4000)
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
  yield takeEvery(actionTypes.ENSURE_LIBRARIES_LOADED, function*(action) {
    yield* checkWebGLAvailable();
  });

  /**
   * Handles the side effect of resetting the WebGL context when context is reset.
   *
   * @see webGLgraphics.js under 'public/externalLibs/graphics' for information on
   * the function.
   */
  yield takeEvery(actionTypes.BEGIN_CLEAR_CONTEXT, function*(action) {
    yield* checkWebGLAvailable();
    const externalLibraryName = (action as actionTypes.IAction).payload.library.external.name;
    switch (externalLibraryName) {
      case ExternalLibraryNames.TWO_DIM_RUNES:
        (window as any).loadLib('TWO_DIM_RUNES');
        (window as any).getReadyWebGLForCanvas('2d');
        break;
      case ExternalLibraryNames.THREE_DIM_RUNES:
        (window as any).loadLib('THREE_DIM_RUNES');
        (window as any).getReadyWebGLForCanvas('3d');
        break;
      case ExternalLibraryNames.CURVES:
        (window as any).loadLib('CURVES');
        (window as any).getReadyWebGLForCanvas('curve');
        break;
    }
    const globals: Array<[string, any]> = (action as actionTypes.IAction).payload.library.globals;
    for (const [key, value] of globals) {
      window[key] = value;
    }
    yield put(
      actions.endClearContext(
        (action as actionTypes.IAction).payload.library,
        (action as actionTypes.IAction).payload.workspaceLocation
      )
    );
    yield undefined;
  });
}

function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, function*() {
    const apiLogin = 'https://luminus.nus.edu.sg/v2/auth/connect/authorize';
    const clientId = LUMINUS_CLIENT_ID;
    const port = window.location.port === '' ? '' : `:${window.location.port}`;
    const callback = `${window.location.protocol}//${window.location.hostname}${port}/login`;
    window.location.href = `${apiLogin}?client_id=${clientId}&redirect_uri=${callback}&response_type=code&scope=profile`;
    yield undefined;
  });
}

function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, function*() {
    const code = yield select((state: IState) => state.workspaces.playground.editorValue);
    const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter);
    const external = yield select(
      (state: IState) => state.workspaces.playground.playgroundExternal
    );
    const newQueryString =
      code === '' || code === defaultEditorValue
        ? undefined
        : qs.stringify({
            prgrm: compressToEncodedURIComponent(code),
            chap: chapter,
            ext: external
          });
    yield put(actions.changeQueryString(newQueryString));
  });
}

let lastDebuggerResult: any;
function* updateInspector() {
  try {
    const start = lastDebuggerResult.context.runtime.nodes[0].loc.start.line - 1;
    const end = lastDebuggerResult.context.runtime.nodes[0].loc.end.line - 1;
    yield put(actions.highlightEditorLine([start, end], location));
    inspectorUpdate(lastDebuggerResult);
    visualiseEnv(lastDebuggerResult);
  } catch (e) {
    put(actions.highlightEditorLine([], location));
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
}

function* evalCode(
  code: string,
  context: Context,
  location: WorkspaceLocation,
  actionType: string
) {
  context.runtime.debuggerOn =
    actionType === actionTypes.EVAL_EDITOR || actionType === actionTypes.DEBUG_RESUME;
  const { result, interrupted, paused } = yield race({
    result:
      actionType === actionTypes.DEBUG_RESUME
        ? call(resume, lastDebuggerResult)
        : call(runInContext, code, context, { scheduler: 'preemptive' }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(actionTypes.BEGIN_INTERRUPT_EXECUTION),
    paused: take(actionTypes.BEGIN_DEBUG_PAUSE)
  });
  if (result) {
    if (actionType === actionTypes.EVAL_EDITOR) {
      lastDebuggerResult = result;
    }
    yield updateInspector();
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value, location));
    } else if (result.status === 'suspended') {
      yield put(actions.endDebuggerPause(location));
      yield put(actions.evalInterpreterSuccess('Breakpoint hit!', location));
    } else {
      yield put(actions.evalInterpreterError(context.errors, location));
    }
  } else if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.debuggerReset(location));
    yield put(actions.endInterruptExecution(location));
    yield call(showWarningMessage, 'Execution aborted', 750);
  } else if (paused) {
    yield put(actions.endDebuggerPause(location));
    lastDebuggerResult = manualToggleDebugger(context);
    yield updateInspector();
    yield call(showWarningMessage, 'Execution paused', 750);
  }
}

function* evalTestCode(code: string, context: Context, location: WorkspaceLocation, index: number) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, { scheduler: 'preemptive' }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(actionTypes.BEGIN_INTERRUPT_EXECUTION)
  });
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value, location));
      yield put(actions.evalTestcaseSuccess(result.value, location, index));
    } else {
      yield put(actions.evalInterpreterError(context.errors, location));
    }
  } else if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.endInterruptExecution(location));
    yield call(showWarningMessage, 'Execution aborted by user', 750);
  }
}

export default mainSaga;
