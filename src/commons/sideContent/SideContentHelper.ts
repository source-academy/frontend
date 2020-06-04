import { DebuggerContext, WorkspaceLocation, WorkspaceLocations } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

const potentialTabs: SideContentTab[] = [sampleTab];

let lastWorkspaceLocation : WorkspaceLocation = WorkspaceLocations.assessment;

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const isEmptyDebuggerContext = Object.keys(debuggerContext).length === 0;
  if (isEmptyDebuggerContext) {
    return [] as SideContentTab[];
  }

  if (debuggerContext.workspaceLocation) {
    lastWorkspaceLocation = debuggerContext.workspaceLocation;
  }

  return potentialTabs.filter(tab => tab.toSpawn(debuggerContext));
};

export const getLastWorkspaceLocation = () => {
  return lastWorkspaceLocation;
};