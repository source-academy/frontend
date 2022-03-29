import { memoize } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

// import { XMLHttpRequest as NodeXMLHttpRequest } from 'xmlhttprequest-ts';
import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { SideContentTab, SideContentType } from './SideContentTypes';

const currentlyActiveTabsLabel: Map<WorkspaceLocation, string[]> = new Map<
  WorkspaceLocation,
  string[]
>();

// Default modules static url. Exported for testing.
export let MODULES_STATIC_URL = 'https://source-academy.github.io/modules';

export function setTabsStaticURL(url: string) {
  MODULES_STATIC_URL = url;
}

async function asyncHttpGet(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const status = response.status;

    if (status !== 200 && status !== 304) throw new Error(); // throw new ModuleConnectionError()

    return await response.text();
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
  }
  throw new Error("Shouldn't get here in asyncHttpGet");
}

const memoizedGetModuleFileAsync = memoize(getModuleFileAsync);
async function getModuleFileAsync(name: string): Promise<string> {
  return convertRawTabToFunction(await asyncHttpGet(`${MODULES_STATIC_URL}/tabs/${name}.js`));
}

// const newHttpRequest = () =>
//   typeof window === 'undefined' ? new NodeXMLHttpRequest() : new XMLHttpRequest();
/**
 * Send a HTTP Get request to the specified endpoint.
 * @return NodeXMLHttpRequest | XMLHttpRequest
 */
// function httpGet(url: string): string {
//   const request = newHttpRequest();
//   try {
//     // If running function in node environment, set request timeout
//     if (typeof window === 'undefined') request.timeout = 10000;
//     request.open('GET', url, false);
//     request.send(null);
//   } catch (error) {
//     if (!(error instanceof DOMException)) throw error;
//   }
//   if (request.status !== 200 && request.status !== 304) throw new Error(); // throw new ModuleConnectionError()
//   return request.responseText;
// }

// const memoizedGetModuleFile = memoize(getModuleFile);
// function getModuleFile(name: string): string {
//   return convertRawTabToFunction(httpGet(`${MODULES_STATIC_URL}/tabs/${name}.js`));
// }

function convertRawTabToFunction(rawTabString: string): string {
  rawTabString = rawTabString.trim();
  const lastBracket = rawTabString.lastIndexOf('(');
  return rawTabString.substring(0, lastBracket) + ')';
}

/**
 * Extracts and processes included Modules' side contents from DebuggerContext
 * @param debuggerContext - DebuggerContext object from redux store
 */
export const getModuleTabs = async (
  debuggerContext: DebuggerContext
): Promise<SideContentTab[]> => {
  // Check if js-slang's context object is null
  if (debuggerContext.context == null) {
    return [];
  }

  // Get module contexts
  const rawModuleContexts = debuggerContext.context.moduleContexts;
  if (rawModuleContexts == null) {
    return [];
  }

  // Load All Tabs concurrently
  const moduleTabs: SideContentTab[] = await Promise.all(
    Array.from(rawModuleContexts.values()).flatMap(moduleState => {
      return moduleState.tabsToSpawn().map(async tabName => {
        const tabFunc = await memoizedGetModuleFileAsync(tabName);
        const tab = eval(tabFunc)(React, ReactDOM);
        return {
          ...tab,
          body: tab.body(debuggerContext),
          id: SideContentType.module
        };
      });
    })
  );

  if (debuggerContext.workspaceLocation) {
    currentlyActiveTabsLabel.set(
      debuggerContext.workspaceLocation,
      moduleTabs.map(tab => tab.label)
    );
  }

  return moduleTabs;
};
