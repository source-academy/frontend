import { TabId } from '@blueprintjs/core';
import React from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';
import { Action, ActionCreatorsMapObject, bindActionCreators, Dispatch } from 'redux';
import { beginStoriesAlertSideContent } from 'src/features/stories/StoriesActions';

import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { beginAlertSideContent } from './SideContentActions';
import {
  ModuleSideContent,
  SideContentLocation,
  SideContentTab,
  SideContentType
} from './SideContentTypes';

// const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
//   WorkspaceLocation,
//   string[]
// >();

const requireProvider = (x: string) => {
  const exports = {
    react: React,
    'react-dom': ReactDOM,
    'react/jsx-runtime': JSXRuntime
  };

  if (!(x in exports)) throw new Error(`Dynamic require of ${x} is not supported`);
  return exports[x];
};

type RawTab = (provider: typeof requireProvider) => ModuleSideContent;

/**
 * Returns an array of SideContentTabs to be spawned
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getDynamicTabs = (debuggerContext: DebuggerContext): SideContentTab[] => {
  const moduleContexts = debuggerContext?.context?.moduleContexts;

  if (!moduleContexts) return [];

  return Object.values(moduleContexts)
    .flatMap(({ tabs }) => tabs ?? [])
    .map((rawTab: RawTab) => rawTab(requireProvider))
    .filter(({ toSpawn }) => !toSpawn || toSpawn(debuggerContext))
    .map(tab => ({
      ...tab,
      body: tab.body(debuggerContext),
      id: SideContentType.module
    }));
};

export const generateIconId = (tabId: TabId) => `${tabId}-icon`;
export const getTabId = (tab: SideContentTab) =>
  tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
export const generateTabAlert = (shouldAlert: boolean) =>
  `side-content-tooltip${shouldAlert && ' side-content-tab-alert'}`;

export const addAlertSideContentToProps = <TDispatchProps extends ActionCreatorsMapObject<any>>(dispatch: Dispatch<Action<unknown>>, loc: SideContentLocation, dispatchProps: TDispatchProps) => ({
  ...bindActionCreators(dispatchProps, dispatch),
  alertSideContent: (newId: SideContentType) => {
    if (loc.workspaceLocation === 'stories') {
      // If in stories workspace, dispatch different event
      dispatch(beginStoriesAlertSideContent(newId, loc.storiesEnv))
    } else if (loc.workspaceLocation) {
      dispatch(beginAlertSideContent(newId, loc.workspaceLocation));
    }
  }
})
