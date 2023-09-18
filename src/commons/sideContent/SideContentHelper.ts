import * as bp3core from '@blueprintjs/core';
import * as bp3icons from '@blueprintjs/icons';
import * as bp3popover from '@blueprintjs/popover2';
import * as jsslang from 'js-slang';
import * as jsslangDist from 'js-slang/dist';
import React from 'react';
import JSXRuntime from 'react/jsx-runtime';
import * as ace from 'react-ace';
import ReactDOM from 'react-dom';

import type { DebuggerContext } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

// const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
//   WorkspaceLocation,
//   string[]
// >();

const requireProvider = (x: string) => {
  const exports = {
    react: React,
    'react/jsx-runtime': JSXRuntime,
    'react-ace': ace,
    'react-dom': ReactDOM,
    '@blueprintjs/core': bp3core,
    '@blueprintjs/icons': bp3icons,
    '@blueprintjs/popover2': bp3popover,
    'js-slang': jsslang,
    'js-slang/dist': jsslangDist
  };

  if (!(x in exports)) throw new Error(`Dynamic require of ${x} is not supported`);
  return exports[x];
};

type RawTab = (provider: ReturnType<typeof requireProvider>) => ModuleSideContent;

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
