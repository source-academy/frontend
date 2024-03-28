import { createAction } from '@reduxjs/toolkit';
import { SALanguage } from 'src/commons/application/ApplicationTypes';

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
import { programConfig } from 'src/pages/playground/Decoder';

export const generateLzString = createAction(GENERATE_LZ_STRING, () => ({ payload: {} }));

export const shortenURL = createAction(SHORTEN_URL, (keyword: string) => ({ payload: keyword }));

export const updateShortURL = createAction(UPDATE_SHORT_URL, (shortURL: string) => ({
  payload: shortURL
}));

export const changeQueryString = createAction(CHANGE_QUERY_STRING, (queryString: string) => ({
  payload: queryString
}));

<<<<<<< HEAD
// export const changeProgramConfig = (config: programConfig) => action(CHANGE_PROGRAM_CONFIG, config);

export const playgroundUpdatePersistenceFile = (file?: PersistenceFile) =>
  action(PLAYGROUND_UPDATE_PERSISTENCE_FILE, file);
=======
export const playgroundUpdatePersistenceFile = createAction(
  PLAYGROUND_UPDATE_PERSISTENCE_FILE,
  (file?: PersistenceFile) => ({ payload: file })
);
>>>>>>> 489b7e41f15c9e512b8974dea861f4c54406de37

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
