import { ActionCreator } from 'redux';

import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const finishInvite = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.FINISH_INVITE,
  payload: { workspaceLocation }
});

export const initInvite: ActionCreator<actionTypes.IAction> = (
  editorValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.INIT_INVITE,
  payload: {
    editorValue,
    workspaceLocation
  }
});

export const invalidEditorSessionId = () => ({
  type: actionTypes.INVALID_EDITOR_SESSION_ID
});

export const setEditorSessionId: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation,
  editorSessionId: string
) => ({
  type: actionTypes.SET_EDITOR_SESSION_ID,
  payload: {
    workspaceLocation,
    editorSessionId
  }
});

/**
 * Sets sharedb websocket status.
 *
 * @param workspaceLocation the workspace to be reset
 * @param websocketStatus 0: CLOSED 1: OPEN
 */
export const setWebsocketStatus: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation,
  websocketStatus: number
) => ({
  type: actionTypes.SET_WEBSOCKET_STATUS,
  payload: {
    workspaceLocation,
    websocketStatus
  }
});
