import { createAction } from '@reduxjs/toolkit';

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { SET_EDITOR_SESSION_ID, SET_SHAREDB_CONNECTED } from './CollabEditingTypes';

export const setEditorSessionId = createAction(
  SET_EDITOR_SESSION_ID,
  (workspaceLocation: WorkspaceLocation, editorSessionId: string) => ({
    payload: { workspaceLocation, editorSessionId }
  })
);

/**
 * Sets ShareDB connection status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param connected whether we are connected to ShareDB
 */
export const setSharedbConnected = createAction(
  SET_SHAREDB_CONNECTED,
  (workspaceLocation: WorkspaceLocation, connected: boolean) => ({
    payload: { workspaceLocation, connected }
  })
);
