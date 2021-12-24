import { Context } from 'js-slang';
import { ExceptionError } from 'js-slang/dist/errors/errors';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  NATIVE_JS_RUN,
  NativeJSEvalPayload,
  NativeJSEvalResult
} from 'src/features/nativeJS/NativeJSTypes';
import { store } from 'src/pages/createStore';

import { OverallState } from '../application/ApplicationTypes';
import { evalNativeJSProgram } from '../nativeJS/NativeJSEval';
import { actions } from '../utils/ActionsHelper';

const dummyLocation = {
  start: { line: 0, column: 0 },
  end: { line: 0, column: 0 }
};

export function* nativeJsSaga(): SagaIterator {
  yield takeEvery(NATIVE_JS_RUN, function* (action: ReturnType<typeof actions.nativeJSRun>) {
    const { workspace, program }: NativeJSEvalPayload = action.payload;

    // Notify workspace & clear REPL
    yield put(actions.updateWorkspace(workspace, { isRunning: true }));
    yield put(actions.clearReplOutput(workspace));
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[workspace].context
    );
    context.errors = [];

    const result: NativeJSEvalResult = yield call(evalNativeJSProgram, program);

    switch (result.status) {
      case 'finished':
        store.dispatch(actions.evalInterpreterSuccess(result.message, workspace));
        break;
      case 'error':
        const error = new ExceptionError(new Error(`${result.message}`), dummyLocation);
        store.dispatch(actions.evalInterpreterError([error], workspace));
        break;
    }
  });
}

export default nativeJsSaga;
