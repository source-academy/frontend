import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import WorkspaceActions from '../WorkspaceActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import type { WorkspaceManagerState } from '../WorkspaceTypes';

export const handleCseAndStepperActions = (
  builder: ActionReducerMapBuilder<WorkspaceManagerState>,
) => {
  builder
    .addCase(WorkspaceActions.updateCurrentStep, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          currentStep: action.payload.steps,
        },
      };
    })
    .addCase(WorkspaceActions.updateStepsTotal, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          stepsTotal: action.payload.steps,
        },
      };
    })
    .addCase(WorkspaceActions.updateBreakpointSteps, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          breakpointSteps: action.payload.breakpointSteps,
        },
      };
    })
    .addCase(WorkspaceActions.updateChangePointSteps, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          changepointSteps: action.payload.changepointSteps,
        },
      };
    })
    .addCase(WorkspaceActions.updateCseSnapshots, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          cseSnapshots: action.payload.snapshots,
          // How a run ended goes with its snapshots: with none (a new run starts, or the tab
          // discards the trace it was left with) there is nothing for it to describe.
          ...(action.payload.snapshots === null ? { cseEnd: null } : {}),
        },
      };
    })
    .addCase(WorkspaceActions.updateCseEnd, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          cseEnd: action.payload.end,
        },
      };
    });
};
