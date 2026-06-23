import { createActions } from '../redux/utils';
import type { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import type { SideContentLocation, SideContentTabId } from './SideContentTypes';

const SideContentActions = createActions('sideContent', {
  beginAlertSideContent: (id: SideContentTabId, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation,
  }),
  endAlertSideContent: (id: SideContentTabId, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation,
  }),
  visitSideContent: (
    newId: SideContentTabId,
    prevId: SideContentTabId | undefined,
    workspaceLocation: SideContentLocation,
  ) => ({ newId, prevId, workspaceLocation }),
  removeSideContentAlert: (id: SideContentTabId, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation,
  }),
  spawnSideContent: (workspaceLocation: SideContentLocation, debuggerContext: DebuggerContext) => ({
    workspaceLocation,
    debuggerContext,
  }),
  resetSideContent: (workspaceLocation: SideContentLocation) => ({ workspaceLocation }),
  changeSideContentHeight: (height: number, workspaceLocation: WorkspaceLocation) => ({
    height,
    workspaceLocation,
  }),
});

// For compatibility with existing code (reducer)
export const {
  beginAlertSideContent,
  endAlertSideContent,
  visitSideContent,
  removeSideContentAlert,
  spawnSideContent,
  resetSideContent,
  changeSideContentHeight,
} = SideContentActions;

// For compatibility with existing code (actions helper)
export default SideContentActions;
