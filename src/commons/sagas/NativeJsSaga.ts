import { Context } from 'js-slang';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  NATIVE_JS_RUN,
  NativeJSEvalResult,
  NativeJSEvalSession,
  NativeJSRunPayload
} from 'src/features/nativeJS/NativeJSTypes';
import { store } from 'src/pages/createStore';

import { OverallState } from '../application/ApplicationTypes';
import { BEGIN_INTERRUPT_EXECUTION } from '../application/types/InterpreterTypes';
import { NativeJSEvaluator } from '../nativeJS/nativeJSEval';
import { actions } from '../utils/ActionsHelper';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

export function* nativeJsSaga(): SagaIterator {
  yield takeEvery(NATIVE_JS_RUN, function* (action: ReturnType<typeof actions.nativeJSRun>) {
    const runPayload: NativeJSRunPayload = action.payload;

    yield put(actions.updateWorkspace(runPayload.workspace, { isRunning: true }));
    yield put(actions.clearReplOutput(runPayload.workspace));
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[runPayload.workspace].context
    );
    context.errors = [];

    const nativeJSRunner = new NativeJSEvaluator();

    yield put(
      actions.nativeJSUpdateSession({
        workspace: runPayload.workspace,
        nativeJSRunner: nativeJSRunner
      })
    );

    const result: NativeJSEvalResult = yield call(
      nativeJSRunner.evalCode.bind(nativeJSRunner),
      runPayload.program
    );

    switch (result.status) {
      case 'finished':
        store.dispatch(actions.evalInterpreterSuccess(result.message, runPayload.workspace));
        break;
      case 'error':
        const error = new ExceptionError(new Error(`${result.message}`), dummyLocation);
        store.dispatch(actions.evalInterpreterError([error], runPayload.workspace));
        break;
      case 'timeout':
        const timeoutError = new ExceptionError(new Error(`${result.message}`), dummyLocation);
        store.dispatch(actions.evalInterpreterError([timeoutError], runPayload.workspace));
        break;
    }
    nativeJSRunner.terminate();
  });

  yield takeEvery(BEGIN_INTERRUPT_EXECUTION, function* () {
    const jsSession: NativeJSEvalSession | undefined = yield select(
      (state: OverallState) => state.session.nativeJsSession
    );

    if (jsSession && jsSession.nativeJSRunner) {
      jsSession.nativeJSRunner.terminate();
      store.dispatch(
        actions.updateWorkspace(jsSession.workspace, {
          isRunning: jsSession.nativeJSRunner.isRunning
        })
      );
    }
  });
}

export default nativeJsSaga;
