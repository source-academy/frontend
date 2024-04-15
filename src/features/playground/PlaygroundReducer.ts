import { Reducer } from 'redux';

import { defaultPlayground } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  PlaygroundState
} from './PlaygroundTypes';

export const PlaygroundReducer: Reducer<PlaygroundState, SourceActionType> = (
  state = defaultPlayground,
  action
) => {
  switch (action.type) {
    case PLAYGROUND_UPDATE_GITHUB_SAVE_INFO:
      return {
        ...state,
        githubSaveInfo: action.payload
      };
    case PLAYGROUND_UPDATE_PERSISTENCE_FILE:
      return {
        ...state,
        persistenceFile: action.payload
      };
    case PLAYGROUND_UPDATE_LANGUAGE_CONFIG:
      return {
        ...state,
        languageConfig: action.payload
      };
    default:
      return state;
  }
};
