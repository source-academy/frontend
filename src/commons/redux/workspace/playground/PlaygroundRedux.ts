import { type PayloadAction, createAction } from '@reduxjs/toolkit';
import { SALanguage } from 'src/commons/application/ApplicationTypes';
import type { GitHubSaveInfo } from 'src/features/github/GitHubTypes';
import type { PersistenceFile } from 'src/features/persistence/PersistenceTypes';

import { defaultPlayground } from '../WorkspaceReduxTypes';
import { createPlaygroundSlice } from './PlaygroundBase';

const { actions: playgroundWorkspaceActions, reducer } = createPlaygroundSlice(
  'playground',
  defaultPlayground,
  {
    changeQueryString(state, { payload }: PayloadAction<string>) {
      state.queryString = payload;
    },
    playgroundUpdateGithubSaveInfo: {
      prepare: (repoName: string, filePath: string, lastSaved: Date) => ({
        payload: { repoName, filePath, lastSaved }
      }),
      reducer(state, { payload }: PayloadAction<GitHubSaveInfo>) {
        state.githubSaveInfo = payload;
      }
    },
    playgroundUpdatePersistenceFile(
      state,
      { payload }: PayloadAction<PersistenceFile | undefined>
    ) {
      state.persistenceFile = payload;
    },
    playgroundUpdateLanguageConfig(state, { payload }: PayloadAction<SALanguage>) {
      state.languageConfig = payload;
    },
    updateShortURL(state, { payload }: PayloadAction<string>) {
      state.shortURL = payload;
    }
  }
);

export { reducer as playgroundReducer };

export const playgroundSagaActions = {
  generateLzString: createAction('playground/generateLzString'),
  shortenUrl: createAction('playground/shortenURL', (url: string) => ({ payload: url }))
};

export const playgroundActions = {
  ...playgroundWorkspaceActions,
  ...playgroundSagaActions
};
