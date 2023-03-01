import memoize from 'lodash/memoize';
import uniq from 'lodash/uniq';
import React from 'react';
import JSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';

import { useTypedSelector } from '../utils/Hooks';
import { DebuggerContext, WorkspaceManagerState } from '../workspace/WorkspaceTypes';
import { ModuleSideContent, SideContentTab, SideContentType } from './SideContentTypes';

const getModuleFile = async (path: string, type: 'text' | 'json') => {
  const resp = await fetch(`${process.env.REACT_APP_MODULE_BACKEND_URL}/${path}`);
  if (type === 'json') return resp.json();
  return resp.text();
};
const memoizedGetModuleFile = memoize(getModuleFile);

const requireProvider = (x: string) => {
  const result = ({
    "react": React,
    "react-dom": ReactDOM,
    "react/jsx-runtime": JSXRuntime
  })[x];
  if (result === undefined) throw new Error(`Internal Error: Unknown import "${x}"!`); else return result;
}

export const getDynamicTabs = async (debuggerContext?: DebuggerContext): Promise<SideContentTab[]> => {
  const moduleContexts = debuggerContext?.context?.moduleContexts;
  if (!moduleContexts) return [];

  const manifest = await memoizedGetModuleFile('modules.json', 'json')
  const bundles = Object.keys(moduleContexts);

  const tabsToSpawn = uniq(bundles.flatMap(bundle => manifest[bundle].tabs));
  const rawTabs = await Promise.all(tabsToSpawn.map(async tabName => {
    const tabFile = await memoizedGetModuleFile(`tabs/${tabName}.js`, 'text');
    // eslint-disable-next-line no-eval
    return eval(tabFile)(requireProvider).default as ModuleSideContent;
  }));

  return rawTabs.filter(({ toSpawn }) => toSpawn && toSpawn(debuggerContext))
    .map((tabContent) => ({
      ...tabContent,
      id: SideContentType.module,
      body: tabContent.body(debuggerContext),
    }))  
}

/**
 * Hook for managing dynamic tabs generated from the debugger context stored in the redux
 * store.
 */
export const useDynamicTabs = (workspaceLocation: keyof WorkspaceManagerState | undefined, selectedTabId?: SideContentType) => { 
  const [visitedTabs, setVisitedTabs] = React.useState<string[]>(selectedTabId ? [selectedTabId] : []);
  const [dynamicTabs, setDynamicTabs] = React.useState<SideContentTab[]>([]);
  // Fetch debuggerContext from store
  const debuggerContext = useTypedSelector(
    state => workspaceLocation && state.workspaces[workspaceLocation].debuggerContext
  );

  React.useEffect(() => {
    (async () => {
      setDynamicTabs(await getDynamicTabs(debuggerContext));
      setVisitedTabs(selectedTabId ? [selectedTabId] : []);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debuggerContext]);

  return [
    dynamicTabs,
    visitedTabs,
    (tab) => setVisitedTabs([...visitedTabs, tab]),
    () => setVisitedTabs([])
  ] as [SideContentTab[], string[], (tab: string) => void, () => void];
};
