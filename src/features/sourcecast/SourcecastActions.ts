import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import {
  CodeDelta,
  FETCH_SOURCECAST_INDEX,
  Input,
  PlaybackData,
  PlaybackStatus,
  SET_CODE_DELTAS_TO_APPLY,
  SET_CURRENT_PLAYER_TIME,
  SET_INPUT_TO_APPLY,
  SET_SOURCECAST_DATA,
  SET_SOURCECAST_PLAYBACK_DURATION,
  SET_SOURCECAST_PLAYBACK_STATUS,
  SourcecastData,
  UPDATE_SOURCECAST_INDEX
} from './SourcecastTypes';

export const fetchSourcecastIndex = (workspaceLocation: WorkspaceLocation) =>
  action(FETCH_SOURCECAST_INDEX, {
    workspaceLocation
  });

export const setCurrentPlayerTime = (playerTime: number, workspaceLocation: WorkspaceLocation) =>
  action(SET_CURRENT_PLAYER_TIME, {
    playerTime,
    workspaceLocation
  });

export const setCodeDeltasToApply = (deltas: CodeDelta[], workspaceLocation: WorkspaceLocation) =>
  action(SET_CODE_DELTAS_TO_APPLY, {
    deltas,
    workspaceLocation
  });

export const setInputToApply = (inputToApply: Input, workspaceLocation: WorkspaceLocation) =>
  action(SET_INPUT_TO_APPLY, {
    inputToApply,
    workspaceLocation
  });

export const setSourcecastData = (
  title: string,
  description: string,
  audioUrl: string,
  playbackData: PlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(SET_SOURCECAST_DATA, {
    title,
    description,
    audioUrl,
    playbackData,
    workspaceLocation
  });

export const setSourcecastDuration = (duration: number, workspaceLocation: WorkspaceLocation) =>
  action(SET_SOURCECAST_PLAYBACK_DURATION, {
    duration,
    workspaceLocation
  });

export const setSourcecastStatus = (
  playbackStatus: PlaybackStatus,
  workspaceLocation: WorkspaceLocation
) =>
  action(SET_SOURCECAST_PLAYBACK_STATUS, {
    playbackStatus,
    workspaceLocation
  });

export const updateSourcecastIndex = (
  index: SourcecastData[],
  workspaceLocation: WorkspaceLocation
) =>
  action(UPDATE_SOURCECAST_INDEX, {
    index,
    workspaceLocation
  });
