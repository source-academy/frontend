import { createAction } from '@reduxjs/toolkit';

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

export const saveSourcecastData = createAction(
  SAVE_SOURCECAST_DATA,
  (
    title: string,
    description: string,
    uid: string,
    audio: Blob,
    playbackData: PlaybackData,
    workspaceLocation: WorkspaceLocation
  ) => ({
    payload: {
      title,
      description,
      uid,
      audio,
      audioUrl: window.URL.createObjectURL(audio),
      playbackData,
      workspaceLocation
    }
  })
);

export const setCurrentPlayerTime = createAction(
  SET_CURRENT_PLAYER_TIME,
  (playerTime: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { playerTime, workspaceLocation }
  })
);

export const setCodeDeltasToApply = createAction(
  SET_CODE_DELTAS_TO_APPLY,
  (deltas: CodeDelta[], workspaceLocation: WorkspaceLocation) => ({
    payload: { deltas, workspaceLocation }
  })
);

export const setInputToApply = createAction(
  SET_INPUT_TO_APPLY,
  (inputToApply: Input, workspaceLocation: WorkspaceLocation) => ({
    payload: { inputToApply, workspaceLocation }
  })
);

export const setSourcecastData = createAction(
  SET_SOURCECAST_DATA,
  (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData,
    workspaceLocation: WorkspaceLocation
  ) => ({ payload: { title, description, uid, audioUrl, playbackData, workspaceLocation } })
);

export const setSourcecastDuration = createAction(
  SET_SOURCECAST_PLAYBACK_DURATION,
  (duration: number, workspaceLocation: WorkspaceLocation) => ({
    payload: { duration, workspaceLocation }
  })
);

export const setSourcecastStatus = createAction(
  SET_SOURCECAST_PLAYBACK_STATUS,
  (playbackStatus: PlaybackStatus, workspaceLocation: WorkspaceLocation) => ({
    payload: { playbackStatus, workspaceLocation }
  })
);
