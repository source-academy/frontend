import { Reducer } from 'redux';
import { ISourcecastWorkspace } from 'src/commons/application/ApplicationTypes';

import {
  SAVE_SOURCECAST_DATA,
  SET_CODE_DELTAS_TO_APPLY,
  SET_INPUT_TO_APPLY,
  SET_SOURCECAST_DATA,
  SET_SOURCECAST_PLAYBACK_DURATION,
  SET_SOURCECAST_PLAYBACK_STATUS,
  UPDATE_SOURCECAST_INDEX
} from 'src/commons/application/types/ActionTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

export const SourcecastReducer: Reducer<ISourcecastWorkspace> = (
  state: ISourcecastWorkspace,
  action: SourceActionType
) => {
  switch (action.type) {
    case SAVE_SOURCECAST_DATA:
      return {
        ...state,
        title: action.payload.title,
        description: action.payload.description,
        audioUrl: action.payload.audioUrl,
        playbackData: action.payload.playbackData
      };
    case SET_CODE_DELTAS_TO_APPLY:
      return {
        ...state,
        codeDeltasToApply: action.payload.deltas
      };
    case SET_INPUT_TO_APPLY:
      return {
        ...state,
        inputToApply: action.payload.inputToApply
      };
    case SET_SOURCECAST_DATA:
      return {
        ...state,
        title: action.payload.title,
        description: action.payload.description,
        audioUrl: action.payload.audioUrl,
        playbackData: action.payload.playbackData
      };
    case SET_SOURCECAST_PLAYBACK_DURATION:
      return {
        ...state,
        playbackDuration: action.payload.duration
      };
    case SET_SOURCECAST_PLAYBACK_STATUS:
      return {
        ...state,
        playbackStatus: action.payload.playbackStatus
      };
    case UPDATE_SOURCECAST_INDEX:
      return {
        ...state,
        sourcecastIndex: action.payload.index
      };
    default:
      return state;
  }
};
