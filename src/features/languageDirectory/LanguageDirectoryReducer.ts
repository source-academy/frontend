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
				if (state.selectedLanguageId === null && state.languages.length > 0) {
					state.selectedLanguageId = state.languages[0].id;
				}
				if (state.selectedEvaluatorId === null && state.languages.length > 0) {
					state.selectedEvaluatorId = state.languages[0].evaluators[0].id;
				}
			})
			.addCase(Actions.setSelectedLanguage, (state, action) => {
				const { languageId, evaluatorId } = action.payload;
				state.selectedLanguageId = languageId;
				state.selectedEvaluatorId = evaluatorId ?? null;
			})
			.addCase(Actions.setSelectedEvaluator, (state, action) => {
				state.selectedEvaluatorId = action.payload.evaluatorId;
			});
	});
