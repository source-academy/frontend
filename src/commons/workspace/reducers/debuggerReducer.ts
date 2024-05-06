import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import InterpreterActions from '../../application/actions/InterpreterActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import { WorkspaceManagerState } from '../WorkspaceTypes';

export const handleDebuggerActions = (builder: ActionReducerMapBuilder<WorkspaceManagerState>) => {
  builder
    .addCase(InterpreterActions.debuggerReset, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(InterpreterActions.debuggerResume, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(InterpreterActions.endDebuggerPause, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = true;
    });
};
