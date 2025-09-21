import { createReducer, type Reducer } from '@reduxjs/toolkit';
import { defaultLanguageDirectory } from 'src/commons/application/ApplicationTypes';
import type { SourceActionType } from 'src/commons/utils/ActionsHelper';

import Actions from './LanguageDirectoryActions';
import type { LanguageDirectoryState } from './LanguageDirectoryTypes';

export const LanguageDirectoryReducer: Reducer<LanguageDirectoryState, SourceActionType> =
  createReducer(defaultLanguageDirectory, builder => {
    builder
      .addCase(Actions.setLanguages, (state, action) => {
        state.languages = action.payload.languages as any;
      })
      .addCase(Actions.setSelectedLanguage, (state, action) => {
        const { languageId, evaluatorId } = action.payload;
        state.selectedLanguageId = languageId;
        state.selectedEvaluatorId = evaluatorId ?? null;
      })
      .addCase(Actions.setSelectedEvaluator, (state, action) => {
        state.selectedEvaluatorId = action.payload.evaluatorId;
      })
      .addCase(Actions.resetConductor, (state, action) => {
        state.languages = [];
        state.selectedLanguageId = null;
        state.selectedEvaluatorId = null;
      });
  });
