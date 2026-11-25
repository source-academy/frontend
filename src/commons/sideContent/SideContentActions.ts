import { createActions } from '../redux/utils';
import type { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import type { SideContentLocation, SideContentTabId } from './SideContentTypes';

const SideContentActions = createActions('sideContent', {
  /** Marks a tab as having news for the user, unless it is already open. */
  alertSideContent: (id: SideContentTabId, workspaceLocation: SideContentLocation) => ({
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
  resetSideContent: (workspaceLocation: SideContentLocation) => ({ workspaceLocation }),
  changeSideContentHeight: (height: number, workspaceLocation: WorkspaceLocation) => ({
    height,
    workspaceLocation,
  }),
});

// For compatibility with existing code (reducer)
export const {
  alertSideContent,
  visitSideContent,
  removeSideContentAlert,
  resetSideContent,
  changeSideContentHeight,
} = SideContentActions;

// For compatibility with existing code (actions helper)
export default SideContentActions;
