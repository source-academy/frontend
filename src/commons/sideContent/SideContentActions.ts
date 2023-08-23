import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  BEGIN_ALERT_SIDE_CONTENT,
  END_ALERT_SIDE_CONTENT,
  SideContentType,
  VISIT_SIDE_CONTENT
} from './SideContentTypes';

export const beginAlertSideContent = (id: SideContentType, workspaceLocation: WorkspaceLocation) =>
  action(BEGIN_ALERT_SIDE_CONTENT, { id, workspaceLocation });
export const endAlertSideContent = (id: SideContentType, workspaceLocation: WorkspaceLocation) =>
  action(END_ALERT_SIDE_CONTENT, { id, workspaceLocation });
export const visitSideContent = (id: SideContentType, workspaceLocation: WorkspaceLocation) =>
  action(VISIT_SIDE_CONTENT, { id, workspaceLocation });
