import { action } from 'typesafe-actions';

import { Input, IPlaybackData } from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const deleteSourcecastEntry = (id: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.DELETE_SOURCECAST_ENTRY, {
    id,
    workspaceLocation
  });

export const recordInit = (initData: IPlaybackData['init'], workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.RECORD_INIT, {
    initData,
    workspaceLocation
  });

export const recordInput = (input: Input, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.RECORD_INPUT, {
    input,
    workspaceLocation
  });

export const resetInputs = (inputs: Input[], workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.RESET_INPUTS, {
    inputs,
    workspaceLocation
  });

export const saveSourcecastData = (
  title: string,
  description: string,
  audio: Blob,
  playbackData: IPlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.SAVE_SOURCECAST_DATA, {
    title,
    description,
    audio,
    audioUrl: window.URL.createObjectURL(audio),
    playbackData,
    workspaceLocation
  });

export const timerPause = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TIMER_PAUSE, {
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerReset = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TIMER_RESET, {
    workspaceLocation
  });

export const timerResume = (timeBefore: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TIMER_RESUME, {
    timeBefore,
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerStart = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TIMER_START, {
    timeNow: Date.now(),
    workspaceLocation
  });

export const timerStop = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.TIMER_STOP, {
    timeNow: Date.now(),
    workspaceLocation
  });
