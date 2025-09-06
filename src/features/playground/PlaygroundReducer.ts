import { createReducer, Reducer } from '@reduxjs/toolkit';

import { defaultPlayground } from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  changeQueryString,
  playgroundConductorEvaluator,
  playgroundConductorLanguage,
  playgroundConfigLanguage,
  playgroundUpdateGitHubSaveInfo,
  playgroundUpdatePersistenceFile,
  updateShortURL
} from './PlaygroundActions';
import { PlaygroundState } from './PlaygroundTypes';

export const PlaygroundReducer: Reducer<PlaygroundState, SourceActionType> = createReducer(
  defaultPlayground,
  builder => {
    builder
      .addCase(changeQueryString, (state, action) => {
        state.queryString = action.payload;
      })
      .addCase(updateShortURL, (state, action) => {
        state.shortURL = action.payload;
      })
      .addCase(playgroundUpdateGitHubSaveInfo, (state, action) => {
        state.githubSaveInfo = action.payload;
      })
      .addCase(playgroundUpdatePersistenceFile, (state, action) => {
        state.persistenceFile = action.payload;
      })
      .addCase(playgroundConfigLanguage, (state, action) => {
        state.languageConfig = action.payload;
      })
      .addCase(playgroundConductorLanguage, (state, action) => {
        state.conductorLanguage = action.payload;
      })
      .addCase(playgroundConductorEvaluator, (state, action) => {
        state.conductorEvaluator = action.payload;
      });
  }
);
