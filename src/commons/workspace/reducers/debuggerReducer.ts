import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import {
  debuggerReset,
  debuggerResume,
  endDebuggerPause
} from '../../application/actions/InterpreterActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import { WorkspaceManagerState } from '../WorkspaceTypes';

export const handleDebuggerActions = (builder: ActionReducerMapBuilder<WorkspaceManagerState>) => {
  builder
    .addCase(debuggerReset, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(debuggerResume, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(endDebuggerPause, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = true;
    });
};
