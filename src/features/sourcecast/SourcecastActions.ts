import { action } from 'typesafe-actions';

import * as actionTypes from 'src/commons/types/ActionTypes';
import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceActions';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SourcecastData
} from 'src/features/sourcecast/SourcecastTypes';

export const fetchSourcecastIndex = (workspaceLocation: WorkspaceLocation) =>
  action(actionTypes.FETCH_SOURCECAST_INDEX, {
    workspaceLocation
  });

export const setCodeDeltasToApply = (deltas: CodeDelta[], workspaceLocation: WorkspaceLocation) =>
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
  playbackData: PlaybackData,
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
  index: SourcecastData[],
  workspaceLocation: WorkspaceLocation
) =>
  action(actionTypes.UPDATE_SOURCECAST_INDEX, {
    index,
    workspaceLocation
  });
