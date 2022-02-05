import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

export const FULL_JS_RUN = 'FULL_JS_RUN';
export interface FullJSEvalPayload {
  workspaceLocation: WorkspaceLocation;
  code: string;
}
