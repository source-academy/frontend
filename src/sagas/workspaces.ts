import { Context, interrupt, resume, runInContext, setBreakpointAtLine } from 'js-slang';
import { InterruptedError } from 'js-slang/dist/interpreter-errors';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { SourceError } from 'js-slang/dist/types';
import { cloneDeep } from 'lodash';
import { SagaIterator } from 'redux-saga';
import { call, delay, put, race, select, take, takeEvery } from 'redux-saga/effects';

import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { WorkspaceLocation } from '../actions/workspaces';
import { ExternalLibraryNames } from '../components/assessment/assessmentShape';
import { externalLibraries } from '../reducers/externalLibraries';
import { IState, IWorkspaceState } from '../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';
import { highlightLine, inspectorUpdate, visualiseEnv } from '../utils/slangHelper';

export default function* workspaceSaga(): SagaIterator {
  let context: Context;

  yield takeEvery(actionTypes.EVAL_EDITOR, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select((state: IState) => {
      const prepend = (state.workspaces[workspaceLocation] as IWorkspaceState).editorPrepend;
      const value = (state.workspaces[workspaceLocation] as IWorkspaceState).editorValue!;
      const postpend = (state.workspaces[workspaceLocation] as IWorkspaceState).editorPostpend;

      return prepend + (prepend.length > 0 ? '\n' : '') + value + '\n' + postpend;
    });
    const chapter: number = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) =>
        (state.workspaces[workspaceLocation] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).globals
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
    yield put(actions.beginInterruptExecution(workspaceLocation));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.beginClearContext(library, workspaceLocation));
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context
    );
    yield* evalCode(code, context, workspaceLocation, actionTypes.EVAL_EDITOR);
  });

  yield takeEvery(actionTypes.TOGGLE_EDITOR_AUTORUN, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const isEditorAutorun = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).isEditorAutorun
    );
    yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
  });

  yield takeEvery(actionTypes.INVALID_EDITOR_SESSION_ID, function*(action) {
    yield call(showWarningMessage, 'Invalid ID Input', 1000);
  });

  yield takeEvery(actionTypes.EVAL_REPL, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).replValue
    );
    yield put(actions.beginInterruptExecution(workspaceLocation));
    yield put(actions.clearReplInput(workspaceLocation));
    yield put(actions.sendReplInputToOutput(code, workspaceLocation));
    context = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context
    );
    yield* evalCode(code, context, workspaceLocation, actionTypes.EVAL_REPL);
  });

  yield takeEvery(actionTypes.DEBUG_RESUME, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const code: string = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).editorValue
    );
    yield put(actions.beginInterruptExecution(workspaceLocation));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context
    );
    yield put(actions.highlightEditorLine([], workspaceLocation));
    yield* evalCode(code, context, workspaceLocation, actionTypes.DEBUG_RESUME);
  });

  yield takeEvery(actionTypes.DEBUG_RESET, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    context = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context
    );
    inspectorUpdate(undefined);
    highlightLine(0);
    yield put(actions.clearReplOutput(workspaceLocation));
    context.runtime.break = false;
    lastDebuggerResult = undefined;
  });

  yield takeEvery(actionTypes.HIGHLIGHT_LINE, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.highlightedLines;
    highlightLine(workspaceLocation);
    yield;
  });

  yield takeEvery(actionTypes.UPDATE_EDITOR_BREAKPOINTS, function*(action) {
    setBreakpointAtLine((action as actionTypes.IAction).payload.breakpoints);
    yield;
  });

  yield takeEvery(actionTypes.EVAL_TESTCASE, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const index = (action as actionTypes.IAction).payload.testcaseId;
    const code: string = yield select((state: IState) => {
      const prepend = (state.workspaces[workspaceLocation] as IWorkspaceState).editorPrepend;
      const value = (state.workspaces[workspaceLocation] as IWorkspaceState).editorValue!;
      const postpend = (state.workspaces[workspaceLocation] as IWorkspaceState).editorPostpend;
      const testcase = (state.workspaces[workspaceLocation] as IWorkspaceState).editorTestcases[
        index
      ].program;

      return (
        prepend +
        (prepend.length > 0 ? '\n' : '') +
        value +
        '\n' +
        postpend +
        (postpend.length > 0 ? '\n' : '') +
        testcase
      );
    });
    const chapter: number = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) =>
        (state.workspaces[workspaceLocation] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).globals
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
    yield put(actions.beginInterruptExecution(workspaceLocation));
    /** Clear the context, with the same chapter and externalSymbols as before. */
    yield put(actions.beginClearContext(library, workspaceLocation));
    yield put(actions.clearReplOutput(workspaceLocation));
    context = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context
    );
    yield* evalTestCode(code, context, workspaceLocation, index);
  });

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const newChapter = (action as actionTypes.IAction).payload.chapter;
    const oldChapter = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context.chapter
    );
    const symbols: string[] = yield select(
      (state: IState) =>
        (state.workspaces[workspaceLocation] as IWorkspaceState).context.externalSymbols
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).globals
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
      yield put(actions.beginClearContext(library, workspaceLocation));
      yield put(actions.clearReplOutput(workspaceLocation));
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
    const workspaceLocation = (action as actionTypes.IAction).payload.workspaceLocation;
    const chapter = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).context.chapter
    );
    const globals: Array<[string, any]> = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).globals
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
    /** Create a race condition between the js files being loaded and a timeout. */
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
      case ExternalLibraryNames.RUNES:
        (window as any).loadLib('RUNES');
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

let lastDebuggerResult: any;
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

export function* evalCode(
  code: string,
  context: Context,
  workspaceLocation: WorkspaceLocation,
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

  if (actionType === actionTypes.EVAL_EDITOR) {
    lastDebuggerResult = result;
  }
  yield updateInspector(workspaceLocation);

  if (result.status !== 'suspended' && result.status !== 'finished') {
    const prepend = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).editorPrepend
    );
    const prependLines = prepend.length > 0 ? prepend.split('\n').length : 0;

    const errors = context.errors.map((error: SourceError) => {
      const newError = cloneDeep(error);
      newError.location.start.line = newError.location.start.line - prependLines;
      newError.location.end.line = newError.location.end.line - prependLines;
      return newError;
    });

    yield put(actions.evalInterpreterError(errors, workspaceLocation));
    return;
  } else if (result.status === 'suspended') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  }

  yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
}

export function* evalTestCode(
  code: string,
  context: Context,
  workspaceLocation: WorkspaceLocation,
  index: number
) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, { scheduler: 'preemptive' }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(actionTypes.BEGIN_INTERRUPT_EXECUTION)
  });

  if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, 'Execution aborted by user', 750);
    return;
  }

  if (result.status !== 'finished') {
    const prepend = yield select(
      (state: IState) => (state.workspaces[workspaceLocation] as IWorkspaceState).editorPrepend
    );
    const prependLines = prepend.length > 0 ? prepend.split('\n').length : 0;

    const errors = context.errors.map((error: SourceError) => {
      const newError = cloneDeep(error);
      newError.location.start.line = newError.location.start.line - prependLines;
      newError.location.end.line = newError.location.end.line - prependLines;
      return newError;
    });

    yield put(actions.evalInterpreterError(errors, workspaceLocation));
    yield put(actions.evalTestcaseFailure('An error occured', workspaceLocation, index));
    return;
  }

  yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
  yield put(actions.evalTestcaseSuccess(result.value, workspaceLocation, index));
}
