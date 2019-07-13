import { ActionCreator } from 'redux';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
  PlaybackStatus
} from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const fetchSourcecastIndex = () => ({
  type: actionTypes.FETCH_SOURCECAST_INDEX
});

export const updateSourcecastIndex = (index: any) => ({
  type: actionTypes.UPDATE_SOURCECAST_INDEX,
  payload: {
    index
  }
});

export const loadPlaybackData = (playbackData: IPlaybackData) => ({
  type: actionTypes.LOAD_PLAYBACK_DATA,
  payload: {
    playbackData
  }
});

export const setCodeDeltasToApply: ActionCreator<actionTypes.IAction> = (deltas: ICodeDelta[]) => ({
  type: actionTypes.SET_CODE_DELTAS_TO_APPLY,
  payload: {
    deltas
  }
});

export const setInputToApply: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation,
  inputToApply: Input
) => ({
  type: actionTypes.SET_INPUT_TO_APPLY,
  payload: {
    workspaceLocation,
    inputToApply
  }
});

export const setSourcecastData: ActionCreator<actionTypes.IAction> = (
  title: string,
  description: string,
  playbackData: IPlaybackData
) => ({
  type: actionTypes.SET_SOURCECAST_DATA,
  payload: {
    title,
    description,
    playbackData
  }
});

export const setSourcecastDuration: ActionCreator<actionTypes.IAction> = (duration: number) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_DURATION,
  payload: {
    duration
  }
});

export const setSourcecastStatus: ActionCreator<actionTypes.IAction> = (
  playbackStatus: PlaybackStatus
) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_STATUS,
  payload: {
    playbackStatus
  }
});
