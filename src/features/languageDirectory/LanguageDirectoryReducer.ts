import { createReducer, type Reducer } from '@reduxjs/toolkit';
// Note: resolver handled in saga; reducer remains synchronous
import type { SourceActionType } from 'src/commons/utils/ActionsHelper';

import Actions from './LanguageDirectoryActions';
import type { LanguageDirectoryState } from './LanguageDirectoryTypes';
import { defaultLanguageDirectoryState } from './LanguageDirectoryTypes';

export const LanguageDirectoryReducer: Reducer<LanguageDirectoryState, SourceActionType> =
	createReducer(defaultLanguageDirectoryState, builder => {
		builder
			.addCase(Actions.setSelectedLanguage, (state, action) => {
				const { languageId, evaluatorId } = action.payload;
				state.selectedLanguageId = languageId;
				state.selectedEvaluatorId = evaluatorId ?? null;
			})
			.addCase(Actions.setSelectedEvaluator, (state, action) => {
				state.selectedEvaluatorId = action.payload.evaluatorId;
			});
	});


