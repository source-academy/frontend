import { SourceError, Value } from 'js-slang/dist/types';

import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const handleConsoleLog = (logString: string, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.HANDLE_CONSOLE_LOG,
  payload: { logString, workspaceLocation }
});

export const evalInterpreterSuccess = (value: Value, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_INTERPRETER_SUCCESS,
  payload: { type: 'result', value, workspaceLocation }
});

export const evalInterpreterError = (
  errors: SourceError[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.EVAL_INTERPRETER_ERROR,
  payload: { type: 'errors', errors, workspaceLocation }
});

export const beginInterruptExecution = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.BEGIN_INTERRUPT_EXECUTION,
  payload: { workspaceLocation }
});

export const endInterruptExecution = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.END_INTERRUPT_EXECUTION,
  payload: { workspaceLocation }
});

export const beginDebuggerPause = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.BEGIN_DEBUG_PAUSE,
  payload: { workspaceLocation }
});

export const endDebuggerPause = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.END_DEBUG_PAUSE,
  payload: { workspaceLocation }
});

export const debuggerResume = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.DEBUG_RESUME,
  payload: { workspaceLocation }
});

export const debuggerReset = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.DEBUG_RESET,
  payload: { workspaceLocation }
});
