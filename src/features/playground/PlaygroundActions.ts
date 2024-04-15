import { createAction } from '@reduxjs/toolkit';
import { SALanguage } from 'src/commons/application/ApplicationTypes';

import { PersistenceFile } from '../persistence/PersistenceTypes';
import {
  PLAYGROUND_UPDATE_GITHUB_SAVE_INFO,
  PLAYGROUND_UPDATE_LANGUAGE_CONFIG,
  PLAYGROUND_UPDATE_PERSISTENCE_FILE
} from './PlaygroundTypes';

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
