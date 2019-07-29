import {
  ICodeDelta,
  Input,
  IPlaybackData,
  ISourcecastData,
  PlaybackStatus
} from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const fetchSourcecastIndex = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.FETCH_SOURCECAST_INDEX,
  payload: {
    workspaceLocation
  }
});

export const setCodeDeltasToApply = (
  deltas: ICodeDelta[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SET_CODE_DELTAS_TO_APPLY,
  payload: {
    deltas,
    workspaceLocation
  }
});

export const setInputToApply = (inputToApply: Input, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.SET_INPUT_TO_APPLY,
  payload: {
    inputToApply,
    workspaceLocation
  }
});

export const setSourcecastData = (
  title: string,
  description: string,
  audioUrl: string,
  playbackData: IPlaybackData,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SET_SOURCECAST_DATA,
  payload: {
    title,
    description,
    audioUrl,
    playbackData,
    workspaceLocation
  }
});

export const setSourcecastDuration = (duration: number, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_DURATION,
  payload: {
    duration,
    workspaceLocation
  }
});

export const setSourcecastStatus = (
  playbackStatus: PlaybackStatus,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SET_SOURCECAST_PLAYBACK_STATUS,
  payload: {
    playbackStatus,
    workspaceLocation
  }
});

export const updateSourcecastIndex = (
  index: ISourcecastData[],
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_SOURCECAST_INDEX,
  payload: {
    index,
    workspaceLocation
  }
});
