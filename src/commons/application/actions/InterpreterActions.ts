import { createAction } from '@reduxjs/toolkit';
import { SourceError, Value } from 'js-slang/dist/types';

import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  END_DEBUG_PAUSE,
  END_INTERRUPT_EXECUTION,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS,
  HANDLE_CONSOLE_LOG
} from '../types/InterpreterTypes';

export const handleConsoleLog = createAction(
  HANDLE_CONSOLE_LOG,
  (workspaceLocation: WorkspaceLocation, ...logString: string[]) => ({
    payload: { logString, workspaceLocation }
  })
);

export const evalInterpreterSuccess = createAction(
  EVAL_INTERPRETER_SUCCESS,
  (value: Value, workspaceLocation: WorkspaceLocation) => ({
    payload: { type: 'result', value, workspaceLocation }
  })
);

export const evalTestcaseSuccess = createAction(
  EVAL_TESTCASE_SUCCESS,
  (value: Value, workspaceLocation: WorkspaceLocation, index: number) => ({
    payload: { type: 'result', value, workspaceLocation, index }
  })
);

export const evalTestcaseFailure = createAction(
  EVAL_TESTCASE_FAILURE,
  (value: Value, workspaceLocation: WorkspaceLocation, index: number) => ({
    payload: { type: 'errors', value, workspaceLocation, index }
  })
);

export const evalInterpreterError = createAction(
  EVAL_INTERPRETER_ERROR,
  (errors: SourceError[], workspaceLocation: WorkspaceLocation) => ({
    payload: { type: 'errors', errors, workspaceLocation }
  })
);

export const beginInterruptExecution = createAction(
  BEGIN_INTERRUPT_EXECUTION,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const endInterruptExecution = createAction(
  END_INTERRUPT_EXECUTION,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const beginDebuggerPause = createAction(
  BEGIN_DEBUG_PAUSE,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const endDebuggerPause = createAction(
  END_DEBUG_PAUSE,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const debuggerResume = createAction(
  DEBUG_RESUME,
  (workspaceLocation: WorkspaceLocation) => ({ payload: { workspaceLocation } })
);

export const debuggerReset = createAction(DEBUG_RESET, (workspaceLocation: WorkspaceLocation) => ({
  payload: { workspaceLocation }
}));
