import { action } from 'typesafe-actions';

import { NATIVE_JS_RUN, NativeJSEvalPayload } from './NativeJSTypes';

export const nativeJSRun = (runPayload: NativeJSEvalPayload) => action(NATIVE_JS_RUN, runPayload);
