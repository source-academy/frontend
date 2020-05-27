import { action } from 'typesafe-actions'; // EDITING

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

import {
  FINISH_INVITE,
  INIT_INVITE,
  INVALID_EDITOR_SESSION_ID,
  SET_EDITOR_SESSION_ID,
  SET_WEBSOCKET_STATUS
} from './CollabEditingTypes';

export const finishInvite = (workspaceLocation: WorkspaceLocation) =>
  action(FINISH_INVITE, { workspaceLocation });

export const initInvite = (editorValue: string, workspaceLocation: WorkspaceLocation) =>
  action(INIT_INVITE, {
    editorValue,
    workspaceLocation
  });

export const invalidEditorSessionId = () => action(INVALID_EDITOR_SESSION_ID);

export const setEditorSessionId = (workspaceLocation: WorkspaceLocation, editorSessionId: string) =>
  action(SET_EDITOR_SESSION_ID, {
    workspaceLocation,
    editorSessionId
  });

/**
 * Sets sharedb websocket status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param websocketStatus 0: CLOSED 1: OPEN
 */
export const setWebsocketStatus = (workspaceLocation: WorkspaceLocation, websocketStatus: number) =>
  action(SET_WEBSOCKET_STATUS, {
    workspaceLocation,
    websocketStatus
  });
