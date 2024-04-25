import { Reducer } from 'redux';

import { defaultPlayground } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  CHANGE_QUERY_STRING,
  DISABLE_FILE_SYSTEM_CONTEXT_MENUS,
  ENABLE_FILE_SYSTEM_CONTEXT_MENUS,
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
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
    case PLAYGROUND_UPDATE_LANGUAGE_CONFIG:
      return {
        ...state,
        languageConfig: action.payload
      };
    case PLAYGROUND_UPDATE_REPO_NAME:
      return {
        ...state,
        repoName: action.payload
      };
    case DISABLE_FILE_SYSTEM_CONTEXT_MENUS:
      return {
        ...state,
        isFileSystemContextMenusDisabled: true
      };
    case ENABLE_FILE_SYSTEM_CONTEXT_MENUS:
      return {
        ...state,
        isFileSystemContextMenusDisabled: false
      };
    default:
      return state;
  }
};
