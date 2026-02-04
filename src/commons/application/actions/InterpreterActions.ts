import { SourceError, Value } from 'js-slang/dist/types';
import { createActions } from 'src/commons/redux/utils';

import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';

const InterpreterActions = createActions('interpreter', {
  handleConsoleLog: (workspaceLocation: WorkspaceLocation, ...logString: string[]) => ({
    logString,
    workspaceLocation
  }),
  evalInterpreterSuccess: (value: Value, workspaceLocation: WorkspaceLocation) => ({
    type: 'result',
    value,
    workspaceLocation
  }),
  evalTestcaseSuccess: (value: Value, workspaceLocation: WorkspaceLocation, index: number) => ({
    type: 'result',
    value,
    workspaceLocation,
    index
  }),
  evalTestcaseFailure: (value: Value, workspaceLocation: WorkspaceLocation, index: number) => ({
    type: 'errors',
    value,
    workspaceLocation,
    index
  }),
  evalInterpreterError: (errors: SourceError[], workspaceLocation: WorkspaceLocation) => ({
    type: 'errors',
    errors,
    workspaceLocation
  }),
  beginInterruptExecution: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  endInterruptExecution: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  beginDebuggerPause: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  endDebuggerPause: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  debuggerResume: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation }),
  debuggerReset: (workspaceLocation: WorkspaceLocation) => ({ workspaceLocation })
});

// For compatibility with existing code (actions helper)
export default InterpreterActions;
