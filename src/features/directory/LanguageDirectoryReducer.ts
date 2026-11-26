import { createReducer, type Reducer } from '@reduxjs/toolkit';
import { generateLanguageMap } from '@sourceacademy/language-directory/dist/util';
import { castDraft } from 'immer';

import { defaultLanguageDirectory } from '../../commons/application/ApplicationTypes';
import type { SourceActionType } from '../../commons/utils/ActionsHelper';
import Actions from './LanguageDirectoryActions';
import type { LanguageDirectoryState } from './LanguageDirectoryTypes';

export const LanguageDirectoryReducer: Reducer<LanguageDirectoryState, SourceActionType> =
  createReducer(defaultLanguageDirectory, builder => {
    builder
      .addCase(Actions.setLanguages, (state, action) => {
        // The directory's definitions are readonly all the way down; the draft's type is not.
        state.languages = castDraft(action.payload.languages);
        state.languageMap = castDraft(
          Object.fromEntries(generateLanguageMap(action.payload.languages)),
        );
      })
      .addCase(Actions.setSelectedLanguage, (state, action) => {
        state.selectedLanguageId = action.payload.languageId;
        state.isDefaultSelection = action.payload.isDefault;
        if (action.payload.evaluatorId) {
          state.selectedEvaluatorId = action.payload.evaluatorId;
        }
      })
      .addCase(Actions.setSelectedEvaluator, (state, action) => {
        state.selectedEvaluatorId = action.payload.evaluatorId;
      })
      .addCase(Actions.clearSelectedLanguage, state => {
        state.selectedLanguageId = null;
        state.selectedEvaluatorId = null;
        state.isDefaultSelection = true;
      });
  });
