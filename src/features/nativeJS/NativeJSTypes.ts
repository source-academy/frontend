import { SourceError } from 'js-slang/dist/types';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

export const NATIVE_JS_RUN = 'NATIVE_JS_RUN';
export interface NativeJSEvalPayload {
  workspaceLocation: WorkspaceLocation;
  code: string;
}

export interface NativeJSEvalResult {
  status: 'finished' | 'error';
  value: any;
  error?: SourceError;
}
