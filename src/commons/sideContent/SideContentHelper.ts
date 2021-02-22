import React from 'react';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { Modules, ModuleSideContent, SideContentTab } from './SideContentTypes';

const potentialTabs: SideContentTab[] = [];

const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
  WorkspaceLocation,
  string[]
>();

export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const spawnedTabs = [
    ...getModuleTabs(debuggerContext).filter(tab => tab.toSpawn(debuggerContext)),
    ...potentialTabs.filter(tab => tab.toSpawn(debuggerContext))
  ];

  if (debuggerContext.workspaceLocation) {
    currentlyActiveTabsLabel.set(
      debuggerContext.workspaceLocation,
      spawnedTabs.map(tab => tab.label)
    );
  }

  return spawnedTabs;
};

/**
 * Extracts and processes included Modules' side contents from DebuggerContext
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getModuleTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  // Get module side contents from DebuggerContext
  const rawModuleTabs = debuggerContext.context?.modules as Modules[] | undefined;
  if (rawModuleTabs == null) return [];

  // Extract all the tabs from all the modules
  const unprocessedTabs = rawModuleTabs.reduce<ModuleSideContent[]>((accumulator, current) => {
    return accumulator.concat(current.sideContents);
  }, []);

  // Initialize module side contents to convert to SideContentTab type
  const moduleTabs: SideContentTab[] = unprocessedTabs.map((sideContent: ModuleSideContent) => ({
    ...sideContent,
    /**
     * @todo Convert the props_placeholder string to actual props or completely remove it.
     */
    body: sideContent.body(React)('props_placeholder')
  }));
  return moduleTabs;
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
