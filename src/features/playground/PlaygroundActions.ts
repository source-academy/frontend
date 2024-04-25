import { createAction } from '@reduxjs/toolkit';
import { SALanguage } from 'src/commons/application/ApplicationTypes';

import { PersistenceFile } from '../persistence/PersistenceTypes';
import {
  CHANGE_QUERY_STRING,
  DISABLE_FILE_SYSTEM_CONTEXT_MENUS,
  ENABLE_FILE_SYSTEM_CONTEXT_MENUS,
  GENERATE_LZ_STRING,
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  PLAYGROUND_UPDATE_REPO_NAME,
  SHORTEN_URL,
  UPDATE_SHORT_URL
} from './PlaygroundTypes';

export const generateLzString = createAction(GENERATE_LZ_STRING, () => ({ payload: {} }));

export const shortenURL = createAction(SHORTEN_URL, (keyword: string) => ({ payload: keyword }));

export const updateShortURL = createAction(UPDATE_SHORT_URL, (shortURL: string) => ({
  payload: shortURL
}));

export const changeQueryString = createAction(CHANGE_QUERY_STRING, (queryString: string) => ({
  payload: queryString
}));

export const playgroundUpdatePersistenceFile = createAction(
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  (file?: PersistenceFile) => ({ payload: file })
);

export const playgroundUpdateGitHubSaveInfo = createAction(
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  (repoName: string, filePath: string, lastSaved: Date) => ({
    payload: { repoName, filePath, lastSaved }
  })
);

export const playgroundConfigLanguage = createAction(
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  (languageConfig: SALanguage) => ({ payload: languageConfig })
);

export const playgroundUpdateRepoName = createAction(
  PLAYGROUND_UPDATE_REPO_NAME,
  (repoName: string) => ({ payload: repoName })
);

export const disableFileSystemContextMenus = createAction(
  DISABLE_FILE_SYSTEM_CONTEXT_MENUS,
  () => ({ payload: {} })
);

export const enableFileSystemContextMenus = createAction(ENABLE_FILE_SYSTEM_CONTEXT_MENUS, () => ({
  payload: {}
}));
