import { ActionCreator } from 'redux';

import { Input } from '../components/sourcecast/sourcecastShape';
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

export const savePlaybackData = (
  title: string,
  description: string,
  audio: Blob,
  playbackData: string
) => ({
  type: actionTypes.SAVE_PLAYBACK_DATA,
  payload: {
    title,
    description,
    audio,
    deltas: playbackData
  }
});

export const recordAudioUrl: ActionCreator<actionTypes.IAction> = (audioUrl: string) => ({
  type: actionTypes.RECORD_AUDIO_URL,
  payload: {
    audioUrl
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
