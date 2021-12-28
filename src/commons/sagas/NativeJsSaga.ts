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

    async function evalWrapper() {
      await new Promise(r => setTimeout(r, 0));
      return call(evalNativeJSProgram, program);
    }
    const result: NativeJSEvalResult = yield (yield evalWrapper()) as Promise<NativeJSEvalResult>;

    switch (result.status) {
      case 'finished':
        store.dispatch(actions.evalInterpreterSuccess(result.message, workspace));
        break;
      case 'error':
        /**
         * This function uses the non-standard feature `Error.prototype.stack`.
         * Not working for SyntaxError.
         *
         * Some examples:
         * `@http://localhost:8000/static/js/main.chunk.js line 31925 > eval:1:1
         *     evalNativeJSProgram@http://localhost:8000/static/js/main.chunk.js:31925:16` --Firefox 91.4.1esr
         * `TypeError: window.dsl is not a function at eval (eval at evalNativeJSProgram (NativeJSEval.ts:6:1), <anonymous>:1:8)` --Chrome 98.0.4758.9
         * Seeking better alternative for this.
         */
        function getErrorLocation() {
          // In case `Error.stack` is undefined, eg. `eval(const enum = 1;)`
          if (result.message.stack) {
            const firefoxStyle = (result.message.stack as string).split('\n')[0].split('eval:');
            const chromeStyle = (result.message.stack as string)
              .split('\n')[1]
              .split('<anonymous>:');

            if (firefoxStyle.length > 1) {
              const locationArray = firefoxStyle[1].slice(0, -1).split(':');
              return {
                start: { line: parseInt(locationArray[0]), column: parseInt(locationArray[1]) },
                end: { line: 0, column: 0 }
              };
            } else if (chromeStyle.length > 1) {
              const locationArray = chromeStyle[1].slice(0, -1).split(':');
              return {
                start: { line: parseInt(locationArray[0]), column: parseInt(locationArray[1]) },
                end: { line: 0, column: 0 }
              };
            } else {
              // Fallback to final attempt: the non-standard `Error.lineNumber` feature supported by Firefox
              return result.message.lineNumber
                ? {
                    start: { line: result.message.lineNumber, column: 0 },
                    end: { line: 0, column: 0 }
                  }
                : dummyLocation;
            }
          } else {
            return dummyLocation;
          }
        }

        const error = new ExceptionError(new Error(`${result.message}`), getErrorLocation());
        store.dispatch(actions.evalInterpreterError([error], workspace));
        break;
    }
  });
}

export default nativeJsSaga;
