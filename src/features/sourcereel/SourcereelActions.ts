import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import { Input, PlaybackData } from '../sourcecast/SourcecastTypes';

import {
  DELETE_SOURCECAST_ENTRY,
  RECORD_INIT,
  RECORD_INPUT,
  RESET_INPUTS,
  SAVE_SOURCECAST_DATA,
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

export const saveSourcecastData = (
  title: string,
  description: string,
  audio: Blob,
  playbackData: PlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(SAVE_SOURCECAST_DATA, {
    title,
    description,
    audio,
    audioUrl: window.URL.createObjectURL(audio),
    playbackData,
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
