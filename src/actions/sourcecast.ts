import {
  ICodeDelta,
  Input,
  IPlaybackData,
  ISourcecastData,
  PlaybackStatus
} from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const fetchSourcecastIndex = () => ({
  type: actionTypes.FETCH_SOURCECAST_INDEX
});

export const setCodeDeltasToApply = (deltas: ICodeDelta[]) => ({
  type: actionTypes.SET_CODE_DELTAS_TO_APPLY,
  payload: {
    deltas
  }
});

export const setInputToApply = (workspaceLocation: WorkspaceLocation, inputToApply: Input) => ({
  type: actionTypes.SET_INPUT_TO_APPLY,
  payload: {
    workspaceLocation,
    inputToApply
  }
});

export const setSourcecastData = (
  title: string,
  description: string,
  audioUrl: string,
  playbackData: IPlaybackData
) => ({
  type: actionTypes.SET_SOURCECAST_DATA,
  payload: {
    title,
    description,
    audioUrl,
    playbackData
  }
});

export const setSourcecastDuration = (duration: number) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_DURATION,
  payload: {
    duration
  }
});

export const setSourcecastStatus = (playbackStatus: PlaybackStatus) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_STATUS,
  payload: {
    playbackStatus
  }
});

export const updateSourcecastIndex = (index: ISourcecastData[]) => ({
  type: actionTypes.UPDATE_SOURCECAST_INDEX,
  payload: {
    index
  }
});
