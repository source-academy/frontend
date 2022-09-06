import React from 'react';
import ReactDOM from 'react-dom';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

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
  // Check if js-slang's context object is null
  if (debuggerContext.context == null) {
    return [];
  }

  // Get module contexts
  const rawModuleContexts = debuggerContext.context.moduleContexts;
  if (rawModuleContexts == null) {
    return [];
  }

  // Pass React into functions
  const unprocessedTabs: ModuleSideContent[] = Object.values(rawModuleContexts).flatMap(context =>
    context.tabs?.map(tab => tab(React, ReactDOM)) ?? []
  );

  // Initialize module side contents to convert to SideContentTab type
  const moduleTabs: SideContentTab[] = unprocessedTabs.map((sideContent: ModuleSideContent) => ({
    ...sideContent,
    body: sideContent.body(debuggerContext)
  }));
  return moduleTabs;
};
