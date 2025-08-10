import { useSelector } from 'react-redux';
import type { Context } from 'js-slang/dist/types';

import type { OverallState } from '../../application/ApplicationTypes';
import { getJsSlangContext } from '../../utils/JsSlangContextStore';
import type { WorkspaceLocation } from '../WorkspaceTypes';

/**
 * Custom hook to get the js-slang context for a specific workspace.
 * 
 * This hook abstracts away the complexity of retrieving contexts from
 * the global store. It uses the context ID stored in Redux to fetch
 * the actual mutable Context object from the JsSlangContextStore.
 * 
 * @param workspaceLocation - The workspace location to get the context for
 * @returns The js-slang Context object, or undefined if not found
 */
export function useJsSlangContext(workspaceLocation: WorkspaceLocation): Context | undefined {
  const contextId = useSelector((state: OverallState) => 
    state.workspaces[workspaceLocation].contextId
  );

  return contextId ? getJsSlangContext(contextId) : undefined;
}

/**
 * Hook to get the context ID (UUID) for a workspace.
 * Useful when you need the ID itself rather than the context object.
 * 
 * @param workspaceLocation - The workspace location to get the context ID for
 * @returns The context ID string, or undefined if not set
 */
export function useJsSlangContextId(workspaceLocation: WorkspaceLocation): string | undefined {
  return useSelector((state: OverallState) => 
    state.workspaces[workspaceLocation].contextId
  );
}

/**
 * Hook to get the debugger context for a workspace.
 * Similar to useJsSlangContext but for the debugger context specifically.
 * 
 * @param workspaceLocation - The workspace location to get the debugger context for
 * @returns The debugger's js-slang Context object, or undefined if not found
 */
export function useDebuggerJsSlangContext(workspaceLocation: WorkspaceLocation): Context | undefined {
  const debuggerContextId = useSelector((state: OverallState) => 
    state.workspaces[workspaceLocation].debuggerContext.contextId
  );

  return debuggerContextId ? getJsSlangContext(debuggerContextId) : undefined;
}