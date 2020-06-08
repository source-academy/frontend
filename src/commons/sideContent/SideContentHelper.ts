import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

const potentialTabs: SideContentTab[] = [sampleTab];

const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
  WorkspaceLocation,
  string[]
>();

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  if (isEmptyDebuggerContext(debuggerContext)) {
    return [] as SideContentTab[];
  }

  const spawnedTabs = potentialTabs.filter(tab => tab.toSpawn(debuggerContext));

  if (debuggerContext.workspaceLocation) {
    currentlyActiveTabsLabel.set(
      debuggerContext.workspaceLocation,
      spawnedTabs.map(tab => tab.label)
    );
  }

  return spawnedTabs;
};

export const getCurrentlyActiveTabs = (
  workspaceLocation?: WorkspaceLocation
): string[] | undefined => {
  if (workspaceLocation) {
    return currentlyActiveTabsLabel.get(workspaceLocation);
  }
  return undefined;
};

export const isCurrentlyActive = (
  label: string,
  workspaceLocation?: WorkspaceLocation
): boolean => {
  const activeTabs = getCurrentlyActiveTabs(workspaceLocation);
  return activeTabs
    ? activeTabs.findIndex((activeTabLabel: string) => activeTabLabel === label) !== -1
    : false;
};

export const isEmptyDebuggerContext = (debuggerContext: DebuggerContext): boolean => {
  return Object.keys(debuggerContext).length === 0;
};
