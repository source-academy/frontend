import { Reducer } from 'redux';

import { defaultPlayground } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  CHANGE_QUERY_STRING,
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  PLAYGROUND_UPDATE_PERSISTENCE_FOLDER,
  PLAYGROUND_UPDATE_REPO_NAME,
  PlaygroundState,
  UPDATE_SHORT_URL
} from './PlaygroundTypes';

export const PlaygroundReducer: Reducer<PlaygroundState, SourceActionType> = (
  state = defaultPlayground,
  action
) => {
  switch (action.type) {
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        queryString: action.payload
      };
    case UPDATE_SHORT_URL:
      return {
        ...state,
        shortURL: action.payload
      };
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
    case PLAYGROUND_UPDATE_PERSISTENCE_FOLDER:
      return {
        ...state,
        persistenceFile: action.payload
      };
    case PLAYGROUND_UPDATE_LANGUAGE_CONFIG:
      return {
        ...state,
        languageConfig: action.payload
      };
    case PLAYGROUND_UPDATE_REPO_NAME:
      return {
        ...state,
        repoName: action.payload
      }
    default:
      return state;
  }
};
