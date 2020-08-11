import { action } from 'typesafe-actions'; // EDITING

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { SET_EDITOR_SESSION_ID, SET_SHAREDB_CONNECTED } from './CollabEditingTypes';

export const setEditorSessionId = (workspaceLocation: WorkspaceLocation, editorSessionId: string) =>
  action(SET_EDITOR_SESSION_ID, {
    workspaceLocation,
    editorSessionId
  });

/**
 * Sets ShareDB connection status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param connected whether we are connected to ShareDB
 */
export const setSharedbConnected = (workspaceLocation: WorkspaceLocation, connected: boolean) =>
  action(SET_SHAREDB_CONNECTED, { workspaceLocation, connected });
