import { action } from 'typesafe-actions';

import {
  NATIVE_JS_RUN,
  NATIVE_JS_UPDATE_SESSION,
  NativeJSEvalSession,
  NativeJSRunPayload
} from './NativeJSTypes';

export const nativeJSRun = (runPayload: NativeJSRunPayload) => action(NATIVE_JS_RUN, runPayload);

export const nativeJSUpdateSession = (sessionPayload: NativeJSEvalSession) =>
  action(NATIVE_JS_UPDATE_SESSION, sessionPayload);
