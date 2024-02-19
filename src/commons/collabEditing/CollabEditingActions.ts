import { action } from 'typesafe-actions'; // EDITING

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  SET_EDITOR_SESSION_ID,
  SET_SESSION_DETAILS,
  SET_SHAREDB_CONNECTED
} from './CollabEditingTypes';

export const setEditorSessionId = (workspaceLocation: WorkspaceLocation, editorSessionId: string) =>
  action(SET_EDITOR_SESSION_ID, {
    workspaceLocation,
    editorSessionId
  });

export const setSessionDetails = (
  workspaceLocation: WorkspaceLocation,
  sessionDetails: { docId: string; readOnly: boolean } | null
) =>
  action(SET_SESSION_DETAILS, {
    workspaceLocation,
    sessionDetails
  });

/**
 * Sets ShareDB connection status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param connected whether we are connected to ShareDB
 */
export const setSharedbConnected = (workspaceLocation: WorkspaceLocation, connected: boolean) =>
  action(SET_SHAREDB_CONNECTED, { workspaceLocation, connected });
