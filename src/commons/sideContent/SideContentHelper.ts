import { TabId } from '@blueprintjs/core';
import React from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';
import { Action, bindActionCreators, Dispatch } from 'redux';

import type { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { beginAlertSideContent } from './SideContentActions';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

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

export type AlertSideContentDispatchProps = {
  alertSideContent: () => void;
};

export const addAlertSideContentToProps = <TDispatchProps>(
  dispatch: Dispatch<Action<unknown>>,
  dispatchProps: TDispatchProps,
  id: SideContentType,
  workspaceLocation: WorkspaceLocation
): TDispatchProps & { alertSideContent: () => void } =>
  bindActionCreators(
    {
      ...dispatchProps,
      alertSideContent: () => beginAlertSideContent(id, workspaceLocation)
    },
    dispatch
  );
