import * as bp3core from '@blueprintjs/core'
import * as bp3icons from '@blueprintjs/icons'
import * as bp3popover from '@blueprintjs/popover2'
import lodash from 'lodash'
import * as phaser from 'phaser'
import React, { useCallback } from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ace from 'react-ace';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';

import { allWorkspaceActions } from '../redux/workspace/AllWorkspacesRedux';
import { useWorkspace } from '../redux/workspace/Hooks';
import { SideContentLocation } from '../redux/workspace/WorkspaceReduxTypes';
import { DebuggerContext, ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

const requireProvider = (x: string) => {
  const exports = {
    react: React,
    'react-dom': ReactDOM,
    'react/jsx-runtime': JSXRuntime,
    'react-ace': ace,
    lodash,
    phaser,
    '@blueprintjs/core': bp3core,
    '@blueprintjs/icons': bp3icons,
    '@blueprintjs/popover': bp3popover
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

export const getTabId = (tab: SideContentTab) =>
  tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
export const generateIconId = (name: string) => `icon-${name}`;

export const useSideContent = (location: SideContentLocation, defaultTab?: SideContentType) => {
  const {
    sideContent: { selectedTabId, ...sideContent }
  } = useWorkspace(location);
  const dispatch = useDispatch();
  const setSelectedTab = useCallback(
    (newId: SideContentType) => {
      dispatch(allWorkspaceActions.visitSideContent(location, newId));
    },
    [dispatch, location]
  );

  const setSideContentHeight = useCallback(
    (height: number) => {
      dispatch(allWorkspaceActions.changeSideContentHeight(location, height));
    },
    [dispatch, location]
  );

  return {
    ...sideContent,
    selectedTab: selectedTabId ?? defaultTab,
    setSelectedTab,
    setSideContentHeight
  };
};
