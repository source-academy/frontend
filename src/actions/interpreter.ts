import { SourceError, Value } from 'js-slang/dist/types';
import { action } from 'typesafe-actions';

import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const handleConsoleLog = (logString: string, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.HANDLE_CONSOLE_LOG, { logString, workspaceLocation });

export const evalInterpreterSuccess = (value: Value, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.EVAL_INTERPRETER_SUCCESS, { type: 'result', value, workspaceLocation });

export const evalTestcaseSuccess = (
  value: Value,
  workspaceLocation: WorkspaceLocation,
  index: number
) => action(actionTypes.EVAL_TESTCASE_SUCCESS, { type: 'result', value, workspaceLocation, index });

export const evalTestcaseFailure = (
  value: Value,
  workspaceLocation: WorkspaceLocation,
  index: number
) => action(actionTypes.EVAL_TESTCASE_FAILURE, { type: 'errors', value, workspaceLocation, index });

export const evalInterpreterError = (errors: SourceError[], workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.EVAL_INTERPRETER_ERROR, { type: 'errors', errors, workspaceLocation });

export const beginInterruptExecution = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.BEGIN_INTERRUPT_EXECUTION, { workspaceLocation });

export const endInterruptExecution = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.END_INTERRUPT_EXECUTION, { workspaceLocation });

export const beginDebuggerPause = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.BEGIN_DEBUG_PAUSE, { workspaceLocation });

export const endDebuggerPause = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.END_DEBUG_PAUSE, { workspaceLocation });

export const debuggerResume = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.DEBUG_RESUME, { workspaceLocation });

export const debuggerReset = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.DEBUG_RESET, { workspaceLocation });
