import {
  DebuggerContext,
  WorkspaceLocation,
  WorkspaceLocations
} from '../workspace/WorkspaceTypes';
import { sampleTab } from './SideContentSampleTab';
import { SideContentTab } from './SideContentTypes';

const potentialTabs: SideContentTab[] = [sampleTab];

let lastWorkspaceLocation: WorkspaceLocation = WorkspaceLocations.assessment;
let currentlyActiveTabsLabel: string[] = [];

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  if (isEmptyDebuggerContext(debuggerContext)) {
    return [] as SideContentTab[];
  }

  if (debuggerContext.workspaceLocation) {
    lastWorkspaceLocation = debuggerContext.workspaceLocation;
  }

  const spawnedTabs = potentialTabs.filter(tab => tab.toSpawn(debuggerContext));
  currentlyActiveTabsLabel = spawnedTabs.map(tab => tab.label);

  return spawnedTabs;
};

export const getLastWorkspaceLocation = (): WorkspaceLocation => {
  return lastWorkspaceLocation;
};

export const getCurrentlyActiveTabs = (): string[] => {
  return currentlyActiveTabsLabel;
};

export const isCurrentlyActive = (label: string): boolean => {
  return currentlyActiveTabsLabel.findIndex(activeTabLabel => activeTabLabel === label) !== -1;
};

export const isEmptyDebuggerContext = (debuggerContext: DebuggerContext): boolean => {
  return Object.keys(debuggerContext).length === 0;
};
