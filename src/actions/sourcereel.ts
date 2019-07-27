import { Input, IPlaybackData } from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const recordEditorInitValue = (
  editorValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.RECORD_EDITOR_INIT_VALUE,
  payload: {
    editorValue,
    workspaceLocation
  }
});

export const recordEditorInput = (input: Input, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.RECORD_EDITOR_INPUT,
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
