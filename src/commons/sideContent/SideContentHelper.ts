import { loadModuleTab } from 'js-slang';
import React from 'react';
import ReactDOM from 'react-dom';

import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

// const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
//   WorkspaceLocation,
//   string[]
// >();

/**
 * Extracts included Modules' side contents from DebuggerContext.
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  // Pass React into functions
  const tabNames = debuggerContext?.context?.modules.moduleTabs ?? [];

  const moduleTabs = tabNames.map(tabName => {
    const sideContent: ModuleSideContent = loadModuleTab(tabName)(React, ReactDOM);

    return {
      ...sideContent,
      body: sideContent.body(debuggerContext),
      id: SideContentType.module
    };
  });

  return moduleTabs;
};
