import type { TabId } from '@blueprintjs/core';
import * as bpcore from '@blueprintjs/core';
import * as bpicons from '@blueprintjs/icons';
import * as jsslang from 'js-slang';
import * as jsslangDist from 'js-slang/dist';
import * as jsslangErrors from 'js-slang/dist/errors/base';
import * as rttcErrors from 'js-slang/dist/errors/rttcErrors';
import * as jsslangOperators from 'js-slang/dist/utils/operators';
import * as jsslangRttc from 'js-slang/dist/utils/rttc';
import Konva from 'konva';
import * as lodash from 'lodash-es';
// We need it to inject modules into the context
// eslint-disable-next-line no-restricted-imports
import * as React from 'react';
import { useCallback } from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ace from 'react-ace';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactKonva from 'react-konva';
import { useAppDispatch } from 'src/commons/utils/Hooks';
import { tabBehaviour } from 'src/features/directory/toolTabs';

import { useAppSelector } from '../utils/Hooks';
import { visitSideContent } from './SideContentActions';
import type {
  PredefinedTabs,
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
    'react-dom/client': ReactDOMClient,
    '@blueprintjs/core': bpcore,
    '@blueprintjs/icons': bpicons,
    'js-slang': jsslang,
    'js-slang/dist': jsslangDist,
    'js-slang/dist/utils/operators': jsslangOperators,
    'js-slang/dist/utils/rttc': jsslangRttc,
    'js-slang/dist/errors/base': jsslangErrors,
    'js-slang/dist/errors/rttcErrors': rttcErrors,
    lodash,
  };

  if (!(x in exports)) {
    throw new Error(`Dynamic require of ${x} is not supported`);
  }
  return exports[x as keyof typeof exports] as any;
};

export const generateIconId = (tabId: TabId) => `${tabId}-icon`;
export const getTabId = (tab: SideContentTab) => (tab.id === undefined ? tab.label : tab.id);

export function combineAllTabs(
  { leadingTabs, trailingTabs }: PredefinedTabs,
  serviceTabs: SideContentTab[],
): SideContentTab[] {
  const serviceTabsById = new Map(serviceTabs.map(tab => [getTabId(tab), tab]));
  const predefinedTabIds = new Set([...leadingTabs, ...trailingTabs].map(getTabId));

  const takeServiceTabIfRegistered = (predefinedTab: SideContentTab) =>
    serviceTabsById.get(getTabId(predefinedTab)) ?? predefinedTab;
  const serviceTabsWithoutPredefinedSlot = serviceTabs.filter(
    serviceTab => !predefinedTabIds.has(getTabId(serviceTab)),
  );

  return [
    ...leadingTabs.map(takeServiceTabIfRegistered),
    ...serviceTabsWithoutPredefinedSlot,
    ...trailingTabs.map(takeServiceTabIfRegistered),
  ];
}

export const generateTabAlert = (shouldAlert: boolean) =>
  `side-content-tooltip${shouldAlert ? ' side-content-tab-alert' : ''}`;

export const useSideContent = (location: SideContentLocation, defaultTab?: SideContentTabId) => {
  const [workspaceLocation] = getLocation(location);
  const { alerts, selectedTab, height }: SideContentState = useAppSelector(
    state => state.sideContent[workspaceLocation],
  );
  const pluginMap = useAppSelector(state => state.pluginDirectory.pluginMap);
  const dispatch = useAppDispatch();
  const setSelectedTab = useCallback(
    (newId: SideContentTabId) => {
      if (
        (selectedTab === SideContentType.substVisualizer ||
          selectedTab === SideContentType.cseMachine ||
          tabBehaviour(pluginMap, selectedTab).hidesRepl) &&
        newId === SideContentType.mobileEditorRun
      ) {
        return;
      }
      dispatch(visitSideContent(newId, selectedTab, location));
    },
    [dispatch, location, selectedTab, pluginMap],
  );

  return {
    alerts,
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
