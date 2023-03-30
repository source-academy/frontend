import React from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';

import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
  WorkspaceLocation,
  string[]
>();

const requireProvider = (x: string) => {
  const pathSegments = x.split('/');

  const recurser = (obj: Record<string, any>, segments: string[]): any => {
    if (segments.length === 0) return obj;
    const currObj = obj[segments[0]];
    if (currObj !== undefined) return recurser(currObj, segments.splice(1));
    throw new Error(`Dynamic require of ${x} is not supported`);
  };

  const exports = {
    react: React,
    'react-dom': ReactDOM,
    'react/jsx-runtime': JSXRuntime
  };

  return recurser(exports, pathSegments);
};

/**
 * Returns an array of SideContentTabs to be spawned
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const tabsToSpawn = getModuleTabs(debuggerContext).filter(tab => tab.toSpawn(debuggerContext));
  // Convert ModuleSideContent to SideContentTab.
  const spawnedTabs: SideContentTab[] = [
    ...tabsToSpawn.map(tab => ({
      ...tab,
      body: tab.body(debuggerContext),
      // set tab.id as module
      id: SideContentType.module
    }))
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
 * Extracts included Modules' side contents from DebuggerContext.
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getModuleTabs = (debuggerContext: DebuggerContext): ModuleSideContent[] => {
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
  const moduleTabs: ModuleSideContent[] = Object.values(rawModuleContexts).flatMap(context =>
    context.tabs?.map((tab: any) => tab(requireProvider) ?? [])
  );

  return moduleTabs;
};
