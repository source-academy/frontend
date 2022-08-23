import { memoize } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

// const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
//   WorkspaceLocation,
//   string[]
// >();

// /**
//  * Returns an array of SideContentTabs to be spawned
//  * @param debuggerContext - DebuggerContext object from redux store
//  */
// export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
//   const tabsToSpawn = getModuleTabs(debuggerContext);
//   const spawnedTabs = [
//     ...tabsToSpawn.map(tab => {
//       // set tab.id as module
//       tab.id = SideContentType.module;
//       return tab;
//     })
//   ];
//   // only set if debuggerContext.workspaceLocation is not undefined
//   if (debuggerContext.workspaceLocation) {
//     currentlyActiveTabsLabel.set(
//       debuggerContext.workspaceLocation,
//       spawnedTabs.map(tab => tab.label)
//     );
//   }
//   return spawnedTabs;
// };

const loadTab = (name: string) => {
  const request = new XMLHttpRequest();
  try {
    request.open('GET', `http://localhost:8022/tabs/${name}.js`, false);
    request.send(null);
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
  }
  if (request.status !== 200 && request.status !== 304) throw new Error(); // throw new ModuleConnectionError()
  return request.responseText;
};
export const memoizedLoadTab = memoize(loadTab);

/**
 * Extracts and processes included Modules' side contents from DebuggerContext
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getModuleTabs = (
  tabNames: string[],
  debuggerContext: DebuggerContext
): SideContentTab[] => {
  // Pass React into functions
  const moduleTabs = tabNames.map(tabName => {
    const sideContent: ModuleSideContent = eval(memoizedLoadTab(tabName))(React, ReactDOM);
    return {
      ...sideContent,
      body: sideContent.body(debuggerContext),
      id: SideContentType.module
    };
  });

  return moduleTabs;
};
