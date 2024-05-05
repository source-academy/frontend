import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultPlayground } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  playgroundConfigLanguage,
  playgroundUpdateGitHubSaveInfo,
  playgroundUpdatePersistenceFile
} from './PlaygroundActions';
import { PlaygroundState } from './PlaygroundTypes';

export const PlaygroundReducer: Reducer<PlaygroundState, SourceActionType> = createReducer(
  defaultPlayground,
  builder => {
    builder
      .addCase(playgroundUpdateGitHubSaveInfo, (state, action) => {
        state.githubSaveInfo = action.payload;
      })
      .addCase(playgroundUpdatePersistenceFile, (state, action) => {
        state.persistenceFile = action.payload;
      })
      .addCase(playgroundConfigLanguage, (state, action) => {
        state.languageConfig = action.payload;
      });
  }
);
