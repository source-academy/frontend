import { TabId } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import { Action, ActionCreatorsMapObject, bindActionCreators, Dispatch } from 'redux';
import {
  beginStoriesAlertSideContent,
  storiesVisitSideContent
} from 'src/features/stories/StoriesActions';

import { useTypedSelector } from '../utils/Hooks';
import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { beginAlertSideContent, visitSideContent } from './SideContentActions';
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
  `side-content-tooltip${shouldAlert ? ' side-content-tab-alert' : ''}`;

/**
 * A wrapper around `mapDispatchToProps` to automatically provide a SideContent's props
 * with the `alertSideContent` prop
 */
export const addAlertSideContentToProps = <TDispatchProps extends ActionCreatorsMapObject<any>>(
  dispatch: Dispatch<Action<unknown>>,
  loc: SideContentLocation,
  dispatchProps: TDispatchProps
) => ({
  ...bindActionCreators(dispatchProps, dispatch),
  alertSideContent: (newId: SideContentType) => {
    if (loc.workspaceLocation === 'stories') {
      // If in stories workspace, dispatch different event
      dispatch(beginStoriesAlertSideContent(newId, loc.storiesEnv));
    } else if (loc.workspaceLocation) {
      dispatch(beginAlertSideContent(newId, loc.workspaceLocation));
    }
  }
});

// type SideContentHook = {
//   setSelectedTab: (newId: SideContentType) => void;
// } & Replace<SideContentState, { selectedTab: SideContentType }>;

export function useSideContentInternal(loc: SideContentLocation, defaultTab?: SideContentType) {
  const dispatch = useDispatch();
  const { selectedTab, ...sideContent } = useTypedSelector(state => {
    if (loc.workspaceLocation === 'stories') {
      return state.stories.envs[loc.storiesEnv].sideContent;
    } else if (loc.workspaceLocation) {
      return state.workspaces[loc.workspaceLocation].sideContent;
    } else {
      return {
        dynamicTabs: [],
        alerts: []
      };
    }
  });

  const setSelectedTab = useCallback(
    (newId: SideContentType) => {
      if (loc.workspaceLocation === 'stories') {
        dispatch(storiesVisitSideContent(newId, loc.storiesEnv));
      } else if (loc.workspaceLocation) {
        dispatch(visitSideContent(newId, selectedTab, loc.workspaceLocation));
      }
    },
    // Not necessary to add dispatch, it's from a hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loc]
  );

  return {
    ...sideContent,
    setSelectedTab,
    selectedTab: selectedTab ?? defaultTab
  };
}

export const useSideContent = (loc: SideContentLocation, defaultTab: SideContentType) => {
  const { selectedTab, setSelectedTab } = useSideContentInternal(loc, defaultTab);
  return [selectedTab!, setSelectedTab] as [SideContentType, (newId: SideContentType) => void];
};
