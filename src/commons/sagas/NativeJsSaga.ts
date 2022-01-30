import { Context } from 'js-slang';
import { fullJSRunner } from 'js-slang/dist/runner/fullJSRunner';
import { Error, Finished } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { NATIVE_JS_RUN, NativeJSEvalPayload } from 'src/features/nativeJS/NativeJSTypes';

import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import { runWrapper } from '../utils/RunHelper';
import { notifyProgramEvaluated } from '../workspace/WorkspaceActions';
import {
  evalInterpreterError,
  evalInterpreterSuccess
} from './../application/actions/InterpreterActions';

export function* nativeJsSaga(): SagaIterator {
  yield takeEvery(NATIVE_JS_RUN, function* (action: ReturnType<typeof actions.nativeJSRun>) {
    const { workspaceLocation, code }: NativeJSEvalPayload = action.payload;
    // Notify workspace & clear REPL
    yield put(actions.clearReplOutput(workspaceLocation));
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].context
    );
    context.errors = [];
    const result: Finished | Error = yield call(runWrapper, fullJSRunner, code, context);

    if (context.errors.length === 0 && 'value' in result) {
      // result: Finished
      yield put(evalInterpreterSuccess(result.value, workspaceLocation));
      yield put(notifyProgramEvaluated(result, undefined, code, context, workspaceLocation));
    } else {
      // result: Error
      yield put(evalInterpreterError(context.errors, workspaceLocation));
    }
  });
}

export default nativeJsSaga;
