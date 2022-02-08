import { Context, runInContext } from 'js-slang';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  NATIVE_JS_RUN,
  NativeJSEvalPayload,
  NativeJSEvalResult
} from 'src/features/nativeJS/NativeJSTypes';

import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import DisplayBufferService from '../utils/DisplayBufferService';
import { createContext } from '../utils/JsSlangHelper';
import { runWrapper } from '../utils/RunHelper';
import { dumpDisplayBuffer } from './WorkspaceSaga';

export function* nativeJsSaga(): SagaIterator {
  yield takeEvery(NATIVE_JS_RUN, function* (action: ReturnType<typeof actions.nativeJSRun>) {
    const { workspace, program }: NativeJSEvalPayload = action.payload;
    // Notify workspace & clear REPL
    yield put(actions.clearReplOutput(workspace));
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[workspace].context
    );
    context.errors = [];

    // TODO clean up
    const evalContext = createContext(context.chapter, [], undefined, context.variant);
    const detachConsole = DisplayBufferService.attachConsole();
    const result: NativeJSEvalResult = yield call(runWrapper, runInContext, program, evalContext);
    detachConsole();

    // Hacks
    context.errors = evalContext.errors;
    context.modules = evalContext.modules;

    yield* dumpDisplayBuffer(workspace);
    switch (result.status) {
      case 'finished':
        yield put(actions.evalInterpreterSuccess(result.value, workspace));
        yield put(actions.notifyProgramEvaluated(result, undefined, program, context, workspace));
        break;
      case 'error':
        yield put(actions.evalInterpreterError(context.errors, workspace));
        break;
    }
  });
}

export default nativeJsSaga;
