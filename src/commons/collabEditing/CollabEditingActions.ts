import { action } from 'typesafe-actions'; // EDITING

import * as actionTypes from 'src/commons/application/types/ActionTypes';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceActions';

export const finishInvite = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.FINISH_INVITE, { workspaceLocation });

export const initInvite = (editorValue: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.INIT_INVITE, {
    editorValue,
    workspaceLocation
  });

export const invalidEditorSessionId = () => action(actionTypes.INVALID_EDITOR_SESSION_ID);

export const setEditorSessionId = (workspaceLocation: WorkspaceLocation, editorSessionId: string) =>
  action(actionTypes.SET_EDITOR_SESSION_ID, {
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
  action(actionTypes.SET_WEBSOCKET_STATUS, {
    workspaceLocation,
    websocketStatus
  });
