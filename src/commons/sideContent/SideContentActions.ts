import { createAction } from '@reduxjs/toolkit';

import { DebuggerContext, type WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  BEGIN_ALERT_SIDE_CONTENT,
  CHANGE_SIDE_CONTENT_HEIGHT,
  END_ALERT_SIDE_CONTENT,
  REMOVE_SIDE_CONTENT_ALERT,
  RESET_SIDE_CONTENT,
  SideContentLocation,
  SideContentType,
  SPAWN_SIDE_CONTENT,
  VISIT_SIDE_CONTENT
} from './SideContentTypes';

export const beginAlertSideContent = createAction(
  BEGIN_ALERT_SIDE_CONTENT,
  (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    payload: { id, workspaceLocation }
  })
);
export const endAlertSideContent = createAction(
  END_ALERT_SIDE_CONTENT,
  (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    payload: { id, workspaceLocation }
  })
);
export const visitSideContent = createAction(
  VISIT_SIDE_CONTENT,
  (
    newId: SideContentType,
    prevId: SideContentType | undefined,
    workspaceLocation: SideContentLocation
  ) => ({ payload: { newId, prevId, workspaceLocation } })
);

export const removeSideContentAlert = createAction(
  REMOVE_SIDE_CONTENT_ALERT,
  (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    payload: { id, workspaceLocation }
  })
);

export const spawnSideContent = createAction(
  SPAWN_SIDE_CONTENT,
  (workspaceLocation: SideContentLocation, debuggerContext: DebuggerContext) => ({
    payload: { workspaceLocation, debuggerContext }
  })
);

export const resetSideContent = createAction(
  RESET_SIDE_CONTENT,
  (workspaceLocation: SideContentLocation) => ({ payload: { workspaceLocation } })
);
export const changeSideContentHeight = createAction(
  CHANGE_SIDE_CONTENT_HEIGHT,
  (height: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { height, workspaceLocation }
  })
);
