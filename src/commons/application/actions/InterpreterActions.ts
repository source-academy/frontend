import { createActions } from 'src/commons/redux/utils';

import { type InterpreterError } from '../../errors/InterpreterError';
import type { WorkspaceLocation } from '../../workspace/WorkspaceTypes';

const InterpreterActions = createActions('interpreter', {
  handleConsoleLog: (workspaceLocation: WorkspaceLocation, ...logString: string[]) => ({
    logString,
    workspaceLocation,
  }),
  appendInterpreterResult: (value: unknown, workspaceLocation: WorkspaceLocation) => ({
    type: 'result',
    value,
    workspaceLocation,
  }),
  evalInterpreterSuccess: (value: unknown, workspaceLocation: WorkspaceLocation) => ({
    type: 'result',
    value,
    workspaceLocation,
  }),
  evalTestcaseSuccess: (value: string, workspaceLocation: WorkspaceLocation, index: number) => ({
    type: 'result',
    value,
    workspaceLocation,
    index,
  }),
  evalTestcaseFailure: (
    value: InterpreterError[],
    workspaceLocation: WorkspaceLocation,
    index: number,
  ) => ({
    type: 'errors',
    value,
    workspaceLocation,
    index,
  }),
  evalInterpreterError: (errors: InterpreterError[], workspaceLocation: WorkspaceLocation) => ({
    type: 'errors',
    errors,
    workspaceLocation,
  }),
  appendInterpreterError: (errors: InterpreterError[], workspaceLocation: WorkspaceLocation) => ({
    type: 'errors',
    errors,
    workspaceLocation,
  }),
  setIsRunning: (isRunning: boolean, workspaceLocation: WorkspaceLocation) => ({
    isRunning,
    workspaceLocation,
  }),
  setIsWaitingForInput: (isWaitingForInput: boolean, workspaceLocation: WorkspaceLocation) => ({
    isWaitingForInput,
    workspaceLocation,
  }),
  beginInterruptExecution: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  endInterruptExecution: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
});

// For compatibility with existing code (actions helper)
export default InterpreterActions;
