import { createAction } from '@reduxjs/toolkit';
import { SALanguage } from 'src/commons/application/ApplicationTypes';
import { action } from 'typesafe-actions';

import { PersistenceFile } from '../persistence/PersistenceTypes';
import {
  CHANGE_QUERY_STRING,
  GENERATE_LZ_STRING,
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  SHORTEN_URL,
  UPDATE_SHORT_URL
} from './PlaygroundTypes';

export const generateLzString = () => action(GENERATE_LZ_STRING);

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
