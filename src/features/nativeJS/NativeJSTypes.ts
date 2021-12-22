import { NativeJSEvaluator } from 'src/commons/nativeJS/nativeJSEval';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

export const NATIVE_JS_RUN = 'NATIVE_JS_RUN';
export const NATIVE_JS_UPDATE_SESSION = 'NATIVE_JS_UPDATE_SESSION';

export interface NativeJSEvalSession {
  workspace: WorkspaceLocation;
  nativeJSRunner?: NativeJSEvaluator;
}

export interface NativeJSRunPayload {
  workspace: WorkspaceLocation;
  program: string;
}

export interface NativeJSEvalResult {
  message: any;
  status: 'finished' | 'error' | 'timeout';
}
