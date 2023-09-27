import { action } from 'typesafe-actions';

import { DebuggerContext } from '../workspace/WorkspaceTypes';
import {
  BEGIN_ALERT_SIDE_CONTENT,
  END_ALERT_SIDE_CONTENT,
  REMOVE_SIDE_CONTENT_ALERT,
  RESET_SIDE_CONTENT,
  SideContentLocation,
  SideContentType,
  SPAWN_SIDE_CONTENT,
  VISIT_SIDE_CONTENT
} from './SideContentTypes';

export const beginAlertSideContent = (
  id: SideContentType,
  workspaceLocation: SideContentLocation
) => action(BEGIN_ALERT_SIDE_CONTENT, { id, workspaceLocation });
export const endAlertSideContent = (id: SideContentType, workspaceLocation: SideContentLocation) =>
  action(END_ALERT_SIDE_CONTENT, { id, workspaceLocation });
export const visitSideContent = (
  newId: SideContentType,
  prevId: SideContentType | undefined,
  workspaceLocation: SideContentLocation
) => action(VISIT_SIDE_CONTENT, { newId, prevId, workspaceLocation });

export const removeSideContentAlert = (
  id: SideContentType,
  workspaceLocation: SideContentLocation
) => action(REMOVE_SIDE_CONTENT_ALERT, { id, workspaceLocation });

export const spawnSideContent = (
  workspaceLocation: SideContentLocation,
  debuggerContext: DebuggerContext
) => action(SPAWN_SIDE_CONTENT, { workspaceLocation, debuggerContext });

export const resetSideContent = (workspaceLocation: SideContentLocation) =>
  action(RESET_SIDE_CONTENT, { workspaceLocation });
