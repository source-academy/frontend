import * as bpcore from '@blueprintjs/core';
import { TabId } from '@blueprintjs/core';
import * as bpicons from '@blueprintjs/icons';
import * as jsslang from 'js-slang';
import * as jsslangDist from 'js-slang/dist';
import lodash from 'lodash';
import phaser from 'phaser';
import React, { useCallback } from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ace from 'react-ace';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';

import { defaultSideContent } from '../application/ApplicationTypes';
import { useTypedSelector } from '../utils/Hooks';
import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { visitSideContent } from './SideContentActions';
import {
  ModuleSideContent,
  NonStoryWorkspaceLocation,
  SideContentLocation,
  SideContentState,
  SideContentTab,
  SideContentType,
  StoryWorkspaceLocation
} from './SideContentTypes';

const requireProvider = (x: string) => {
  const exports = {
    react: React,
    'react/jsx-runtime': JSXRuntime,
    'react-ace': ace,
    'react-dom': ReactDOM,
    '@blueprintjs/core': bpcore,
    '@blueprintjs/icons': bpicons,
    'js-slang': jsslang,
    'js-slang/dist': jsslangDist,
    lodash,
    phaser
  };

  if (!(x in exports)) throw new Error(`Dynamic require of ${x} is not supported`);
  return exports[x as keyof typeof exports] as any;
};

type RawTab = (provider: ReturnType<typeof requireProvider>) => { default: ModuleSideContent };

/**
 * Returns an array of SideContentTabs to be spawned
 * @param debuggerContext - DebuggerContext object from redux store
 */
export function getDynamicTabs(debuggerContext: DebuggerContext): SideContentTab[] {
  const moduleContexts = debuggerContext?.context?.moduleContexts;

  if (!moduleContexts) return [];

  return Object.values(moduleContexts)
    .flatMap(({ tabs }) => tabs ?? [])
    .map((rawTab: RawTab) => {
      const { default: content } = rawTab(requireProvider);
      return content;
    })
    .filter(({ toSpawn }) => !toSpawn || toSpawn(debuggerContext))
    .map(tab => ({
      ...tab,
      body: tab.body(debuggerContext),
      id: SideContentType.module
    }));
}

export const generateIconId = (tabId: TabId) => `${tabId}-icon`;
export const getTabId = (tab: SideContentTab) =>
  tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
export const generateTabAlert = (shouldAlert: boolean) =>
  `side-content-tooltip${shouldAlert ? ' side-content-tab-alert' : ''}`;

export const useSideContent = (location: SideContentLocation, defaultTab?: SideContentType) => {
  const [workspaceLocation, storyEnv] = getLocation(location);
  const { alerts, dynamicTabs, selectedTab, height }: SideContentState = useTypedSelector(state =>
    workspaceLocation === 'stories'
      ? (state.sideContent.stories[storyEnv] ?? { ...defaultSideContent })
      : state.sideContent[workspaceLocation]
  );
  const dispatch = useDispatch();
  const setSelectedTab = useCallback(
    (newId: SideContentType) => {
      if (
        (selectedTab === SideContentType.substVisualizer ||
          selectedTab === SideContentType.cseMachine) &&
        newId === SideContentType.mobileEditorRun
      ) {
        return;
      }
      dispatch(visitSideContent(newId, selectedTab, location));
    },
    [dispatch, location, selectedTab]
  );

  return {
    alerts,
    dynamicTabs,
    selectedTab: selectedTab ?? defaultTab,
    setSelectedTab,
    height
  };
};

/**
 * Determine if the given SideContentLocation is a Story location specification
 * or a regular WorkspaceSpecification
 */
export const isStoryLocation = (
  location: SideContentLocation
): location is StoryWorkspaceLocation => location.startsWith('stories');

/**
 * Give a SideContentLocation specification, return the WorkspaceLocation
 * and StoryEnv value, if present
 */
export const getLocation = (
  location: SideContentLocation
): [NonStoryWorkspaceLocation] | ['stories', string] => {
  if (isStoryLocation(location)) return location.split('.', 2) as ['stories', string];
  return [location];
};
