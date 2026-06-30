import type { TabId } from '@blueprintjs/core';
import * as bpcore from '@blueprintjs/core';
import * as bpicons from '@blueprintjs/icons';
import * as jsslang from 'js-slang';
import * as jsslangDist from 'js-slang/dist';
import Konva from 'konva';
import * as lodash from 'lodash-es';
// We need it to inject modules into the context
// eslint-disable-next-line no-restricted-imports
import * as React from 'react';
import { useCallback } from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ace from 'react-ace';
import ReactDOM from 'react-dom';
import * as ReactKonva from 'react-konva';
import { useDispatch } from 'react-redux';

import { useTypedSelector } from '../utils/Hooks';
import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { visitSideContent } from './SideContentActions';
import type {
  ModuleSideContent,
  SideContentLocation,
  SideContentState,
  SideContentTab,
  SideContentTabId,
} from './SideContentTypes';
import { SideContentType } from './SideContentTypes';

export const requireProvider = (x: string) => {
  const exports = {
    react: React,
    'react/jsx-runtime': JSXRuntime,
    'react-ace': ace,
    'react-dom': ReactDOM,
    'react-konva': ReactKonva,
    konva: Konva,
    '@blueprintjs/core': bpcore,
    '@blueprintjs/icons': bpicons,
    konva: Konva,
    'react-konva': ReactKonva,
    'js-slang': jsslang,
    'js-slang/dist': jsslangDist,
    lodash,
  };

  if (!(x in exports)) throw new Error(`Dynamic require of ${x} is not supported`);
  return exports[x as keyof typeof exports] as any;
};

export type RawTab = (provider: ReturnType<typeof requireProvider>) => {
  default: ModuleSideContent;
};

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
      id: SideContentType.module,
    }));
}

export const generateIconId = (tabId: TabId) => `${tabId}-icon`;
export const getTabId = (tab: SideContentTab) =>
  tab.id === undefined || tab.id === SideContentType.module ? tab.label : tab.id;
export const generateTabAlert = (shouldAlert: boolean) =>
  `side-content-tooltip${shouldAlert ? ' side-content-tab-alert' : ''}`;

export const useSideContent = (location: SideContentLocation, defaultTab?: SideContentTabId) => {
  const [workspaceLocation] = getLocation(location);
  const { alerts, dynamicTabs, selectedTab, height }: SideContentState = useTypedSelector(
    state => state.sideContent[workspaceLocation],
  );
  const dispatch = useDispatch();
  const setSelectedTab = useCallback(
    (newId: SideContentTabId) => {
      if (
        (selectedTab === SideContentType.substVisualizer ||
          selectedTab === SideContentType.cseMachine) &&
        newId === SideContentType.mobileEditorRun
      ) {
        return;
      }
      dispatch(visitSideContent(newId, selectedTab, location));
    },
    [dispatch, location, selectedTab],
  );

  return {
    alerts,
    dynamicTabs,
    selectedTab: selectedTab ?? defaultTab,
    setSelectedTab,
    height,
  };
};

/**
 * Give a SideContentLocation specification, return the WorkspaceLocation
 */
export const getLocation = (location: SideContentLocation): [location: SideContentLocation] => [
  location,
];
