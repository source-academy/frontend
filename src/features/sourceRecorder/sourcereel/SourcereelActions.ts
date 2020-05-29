import { action } from 'typesafe-actions';

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

export const deleteSourcecastEntry = (id: number, workspaceLocation: WorkspaceLocation) =>
  action(DELETE_SOURCECAST_ENTRY, {
    id,
    workspaceLocation
  });

export const recordInit = (initData: PlaybackData['init'], workspaceLocation: WorkspaceLocation) =>
  action(RECORD_INIT, {
    initData,
    workspaceLocation
  });

export const recordInput = (input: Input, workspaceLocation: WorkspaceLocation) =>
  action(RECORD_INPUT, {
    input,
    workspaceLocation
  });

export const resetInputs = (inputs: Input[], workspaceLocation: WorkspaceLocation) =>
  action(RESET_INPUTS, {
    inputs,
    workspaceLocation
  });

export const timerPause = (workspaceLocation: WorkspaceLocation) =>
  action(TIMER_PAUSE, {
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerReset = (workspaceLocation: WorkspaceLocation) =>
  action(TIMER_RESET, {
    workspaceLocation
  });

export const timerResume = (timeBefore: number, workspaceLocation: WorkspaceLocation) =>
  action(TIMER_RESUME, {
    timeBefore,
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerStart = (workspaceLocation: WorkspaceLocation) =>
  action(TIMER_START, {
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerStop = (workspaceLocation: WorkspaceLocation) =>
  action(TIMER_STOP, {
    timeNow: Date.now(),
    workspaceLocation
  });
