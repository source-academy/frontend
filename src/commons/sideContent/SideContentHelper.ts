import React from 'react';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { Modules, ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
  WorkspaceLocation,
  string[]
>();

/**
 * Returns an array of SideContentTabs to be spawned
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const tabsToSpawn = getModuleTabs(debuggerContext).filter(tab => tab.toSpawn(debuggerContext));
  const spawnedTabs = [
    ...tabsToSpawn.map(tab => {
      // set tab.id as module
      tab.id = SideContentType.module;
      return tab;
    })
  ];
  // only set if debuggerContext.workspaceLocation is not undefined
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
