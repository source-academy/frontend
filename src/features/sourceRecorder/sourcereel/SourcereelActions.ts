import { createAction } from '@reduxjs/toolkit';

import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import { Input, PlaybackData } from '../SourceRecorderTypes';
import {
  DELETE_SOURCECAST_ENTRY,
  RECORD_INIT,
  RECORD_INPUT,
  RESET_INPUTS,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from './SourcereelTypes';

export const deleteSourcecastEntry = createAction(
  DELETE_SOURCECAST_ENTRY,
  (id: number, workspaceLocation: WorkspaceLocation) => ({ payload: { id, workspaceLocation } })
);

export const recordInit = createAction(
  RECORD_INIT,
  (initData: PlaybackData['init'], workspaceLocation: WorkspaceLocation) => ({
    payload: { initData, workspaceLocation }
  })
);

export const recordInput = createAction(
  RECORD_INPUT,
  (input: Input, workspaceLocation: WorkspaceLocation) => ({
    payload: { input, workspaceLocation }
  })
);

export const resetInputs = createAction(
  RESET_INPUTS,
  (inputs: Input[], workspaceLocation: WorkspaceLocation) => ({
    payload: { inputs, workspaceLocation }
  })
);

export const timerPause = createAction(TIMER_PAUSE, (workspaceLocation: WorkspaceLocation) => ({
  payload: { timeNow: Date.now(), workspaceLocation }
}));

export const timerReset = createAction(TIMER_RESET, (workspaceLocation: WorkspaceLocation) => ({
  payload: { workspaceLocation }
}));

export const timerResume = createAction(
  TIMER_RESUME,
  (timeBefore: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { timeBefore, timeNow: Date.now(), workspaceLocation }
  })
);

export const timerStart = createAction(TIMER_START, (workspaceLocation: WorkspaceLocation) => ({
  payload: { timeNow: Date.now(), workspaceLocation }
}));

export const timerStop = createAction(TIMER_STOP, (workspaceLocation: WorkspaceLocation) => ({
  payload: { timeNow: Date.now(), workspaceLocation }
}));
