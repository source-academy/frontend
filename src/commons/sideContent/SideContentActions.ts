import { createActions } from '../redux/utils';
import { DebuggerContext, type WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { SideContentLocation, SideContentType } from './SideContentTypes';

const SideContentActions = createActions('sideContent', {
  beginAlertSideContent: (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation
  }),
  endAlertSideContent: (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation
  }),
  visitSideContent: (
    newId: SideContentType,
    prevId: SideContentType | undefined,
    workspaceLocation: SideContentLocation
  ) => ({ newId, prevId, workspaceLocation }),
  removeSideContentAlert: (id: SideContentType, workspaceLocation: SideContentLocation) => ({
    id,
    workspaceLocation
  }),
  spawnSideContent: (workspaceLocation: SideContentLocation, debuggerContext: DebuggerContext) => ({
    workspaceLocation,
    debuggerContext
  }),
  resetSideContent: (workspaceLocation: SideContentLocation) => ({ workspaceLocation }),
  changeSideContentHeight: (height: number, workspaceLocation: WorkspaceLocation) => ({
    height,
    workspaceLocation
  })
});

// For compatibility with existing code (reducer)
export const {
  beginAlertSideContent,
  endAlertSideContent,
  visitSideContent,
  removeSideContentAlert,
  spawnSideContent,
  resetSideContent,
  changeSideContentHeight
} = SideContentActions;

// For compatibility with existing code (actions helper)
export default SideContentActions;
