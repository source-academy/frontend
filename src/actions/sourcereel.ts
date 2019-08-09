import { Input, IPlaybackData } from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const deleteSourcecastEntry = (id: number, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.DELETE_SOURCECAST_ENTRY,
  payload: {
    id,
    workspaceLocation
  }
});

export const recordInit = (
  initData: IPlaybackData['init'],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.RECORD_INIT,
  payload: {
    initData,
    workspaceLocation
  }
});

export const recordInput = (input: Input, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.RECORD_INPUT,
  payload: {
    input,
    workspaceLocation
  }
});

export const saveSourcecastData = (
  title: string,
  description: string,
  audio: Blob,
  playbackData: IPlaybackData,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SAVE_SOURCECAST_DATA,
  payload: {
    title,
    description,
    audio,
    audioUrl: window.URL.createObjectURL(audio),
    playbackData,
    workspaceLocation
  }
});

export const timerPause = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.TIMER_PAUSE,
  payload: {
    timeNow: Date.now(),
    workspaceLocation
  }
});

export const timerReset = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.TIMER_RESET,
  payload: {
    workspaceLocation
  }
});

export const timerResume = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.TIMER_RESUME,
  payload: {
    timeNow: Date.now(),
    workspaceLocation
  }
});

export const timerStart = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.TIMER_START,
  payload: {
    timeNow: Date.now(),
    workspaceLocation
  }
});

export const timerStop = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.TIMER_STOP,
  payload: {
    timeNow: Date.now(),
    workspaceLocation
  }
});
