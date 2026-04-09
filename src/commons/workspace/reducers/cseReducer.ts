import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import WorkspaceActions from '../WorkspaceActions';
import { getWorkspaceLocation } from '../WorkspaceReducer';
import { WorkspaceManagerState } from '../WorkspaceTypes';

export const handleCseAndStepperActions = (
  builder: ActionReducerMapBuilder<WorkspaceManagerState>
) => {
  builder
    .addCase(WorkspaceActions.changeStepLimit, (state, action) => {
      // TODO: Use a separate step limit for CSE and Stepper
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].stepLimit = action.payload.stepLimit;
    })
    .addCase(WorkspaceActions.toggleUsingSubst, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].usingSubst = action.payload.usingSubst;
      }
    })
    .addCase(WorkspaceActions.toggleUsingCse, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].usingCse = action.payload.usingCse;
      }
    })
    .addCase(WorkspaceActions.toggleUpdateCse, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].updateCse = action.payload.updateCse;
      }
    })
    .addCase(WorkspaceActions.updateCurrentStep, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          currentStep: action.payload.steps
        }
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
          stepsTotal: action.payload.steps
        }
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
          breakpointSteps: action.payload.breakpointSteps
        }
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
          changepointSteps: action.payload.changepointSteps
        }
      };
    });
};
