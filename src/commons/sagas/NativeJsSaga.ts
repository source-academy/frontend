import { Context } from 'js-slang';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  NATIVE_JS_RUN,
  NativeJSEvalPayload,
  NativeJSEvalResult
} from 'src/features/nativeJS/NativeJSTypes';

import { OverallState } from '../application/ApplicationTypes';
import { evalNativeJSProgram } from '../nativeJS/NativeJSEval';
import { actions } from '../utils/ActionsHelper';
import { runWrapper } from '../utils/RunHelper';

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

    const result: NativeJSEvalResult = yield call(runWrapper, evalNativeJSProgram, program);

    switch (result.status) {
      case 'finished':
        yield put(actions.evalInterpreterSuccess(result.value, workspace));
        break;
      case 'error':
        yield put(actions.evalInterpreterError([result.error!], workspace));
        break;
    }
  });
}

export default nativeJsSaga;
