import { ActionCreator } from 'redux';

import { Input, IPlaybackData } from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const recordEditorInput: ActionCreator<actionTypes.IAction> = (
  location: WorkspaceLocation,
  input: Input
) => ({
  type: actionTypes.RECORD_EDITOR_INPUT,
  payload: {
    location,
    input
  }
});

export const saveSourcecastData = (
  title: string,
  description: string,
  audio: Blob,
  playbackData: IPlaybackData
) => ({
  type: actionTypes.SAVE_SOURCECAST_DATA,
  payload: {
    title,
    description,
    audio,
    playbackData
  }
});

export const recordEditorInitValue: ActionCreator<actionTypes.IAction> = (editorValue: string) => ({
  type: actionTypes.RECORD_EDITOR_INIT_VALUE,
  payload: {
    editorValue
  }
});

export const timerPause: ActionCreator<actionTypes.IAction> = (timeNow: number) => ({
  type: actionTypes.TIMER_PAUSE,
  payload: {
    timeNow: Date.now()
  }
});

export const timerReset = () => ({
  type: actionTypes.TIMER_RESET
});

export const timerResume: ActionCreator<actionTypes.IAction> = (timeNow: number) => ({
  type: actionTypes.TIMER_RESUME,
  payload: {
    timeNow: Date.now()
  }
});

export const timerStart: ActionCreator<actionTypes.IAction> = (timeNow: number) => ({
  type: actionTypes.TIMER_START,
  payload: {
    timeNow: Date.now()
  }
});

export const timerStop: ActionCreator<actionTypes.IAction> = (timeNow: number) => ({
  type: actionTypes.TIMER_STOP,
  payload: {
    timeNow: Date.now()
  }
});
