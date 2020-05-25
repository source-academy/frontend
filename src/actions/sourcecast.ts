import { action } from 'typesafe-actions';

import {
  ICodeDelta,
  Input,
  IPlaybackData,
  ISourcecastData,
  PlaybackStatus
} from '../components/sourcecast/sourcecastShape';
import * as actionTypes from './actionTypes';
import { WorkspaceLocation } from './workspaces';

export const fetchSourcecastIndex = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.FETCH_SOURCECAST_INDEX, {
    workspaceLocation
  });

export const setCurrentPlayerTime = (playerTime: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.SET_CURRENT_PLAYER_TIME, {
    playerTime,
    workspaceLocation
  });

export const setCodeDeltasToApply = (deltas: ICodeDelta[], workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.SET_CODE_DELTAS_TO_APPLY, {
    deltas,
    workspaceLocation
  });

export const setInputToApply = (inputToApply: Input, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.SET_INPUT_TO_APPLY, {
    inputToApply,
    workspaceLocation
  });

export const setSourcecastData = (
  title: string,
  description: string,
  audioUrl: string,
  playbackData: IPlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.SET_SOURCECAST_DATA, {
    title,
    description,
    audioUrl,
    playbackData,
    workspaceLocation
  });

export const setSourcecastDuration = (duration: number, workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.SET_SOURCECAST_PLAYBACK_DURATION, {
    duration,
    workspaceLocation
  });

export const setSourcecastStatus = (
  playbackStatus: PlaybackStatus,
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.SET_SOURCECAST_PLAYBACK_STATUS, {
    playbackStatus,
    workspaceLocation
  });

export const updateSourcecastIndex = (
  index: ISourcecastData[],
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.UPDATE_SOURCECAST_INDEX, {
    index,
    workspaceLocation
  });
