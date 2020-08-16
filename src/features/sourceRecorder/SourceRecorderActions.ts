import { action } from 'typesafe-actions';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SAVE_SOURCECAST_DATA,
  SET_CODE_DELTAS_TO_APPLY,
  SET_CURRENT_PLAYER_TIME,
  SET_INPUT_TO_APPLY,
  SET_SOURCECAST_DATA,
  SET_SOURCECAST_PLAYBACK_DURATION,
  SET_SOURCECAST_PLAYBACK_STATUS
} from './SourceRecorderTypes';

export const saveSourcecastData = (
  title: string,
  description: string,
  uid: string,
  audio: Blob,
  playbackData: PlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(SAVE_SOURCECAST_DATA, {
    title,
    description,
    uid,
    audio,
    audioUrl: window.URL.createObjectURL(audio),
    playbackData,
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
  uid: string,
  audioUrl: string,
  playbackData: PlaybackData,
  workspaceLocation: WorkspaceLocation
) =>
  action(SET_SOURCECAST_DATA, {
    title,
    description,
    uid,
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
