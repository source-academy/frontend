import { createReducer, type Reducer } from '@reduxjs/toolkit';
import { generateLanguageMap } from '@sourceacademy/language-directory/dist/util';

import { defaultLanguageDirectory } from '../../commons/application/ApplicationTypes';
import type { SourceActionType } from '../../commons/utils/ActionsHelper';
import Actions from './LanguageDirectoryActions';
import type { LanguageDirectoryState } from './LanguageDirectoryTypes';

export const LanguageDirectoryReducer: Reducer<LanguageDirectoryState, SourceActionType> =
  createReducer(defaultLanguageDirectory, builder => {
    builder
      .addCase(Actions.setLanguages, (state, action) => {
        state.languages = action.payload.languages;
        state.languageMap = Object.fromEntries(generateLanguageMap(action.payload.languages));
      })
      .addCase(Actions.setSelectedLanguage, (state, action) => {
        state.selectedLanguageId = action.payload.languageId;
      })
      .addCase(Actions.setSelectedEvaluator, (state, action) => {
        state.selectedEvaluatorId = action.payload.evaluatorId;
      });
  });
