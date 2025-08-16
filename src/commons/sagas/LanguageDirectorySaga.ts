import { call, put, select } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { staticLanguageDirectoryProvider } from 'src/features/languageDirectory/LanguageDirectoryTypes';

import LanguageDirectoryActions from '../../features/languageDirectory/LanguageDirectoryActions';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';

const LanguageDirectorySaga = combineSagaHandlers({
  [LanguageDirectoryActions.fetchLanguages.type]: function* () {
    const langs = yield call(staticLanguageDirectoryProvider.getLanguages.bind(staticLanguageDirectoryProvider));
    yield put(actions.setLanguages(langs));
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* (action) {
    const {
      payload: { languageId, evaluatorId }
    } = action;
    if (evaluatorId) return; // already explicitly set
    const language = yield call(staticLanguageDirectoryProvider.getLanguageById.bind(staticLanguageDirectoryProvider), languageId);
    if (!language) return;
    const defaultEvaluatorId: string | null = language.evaluators.length > 0 ? language.evaluators[0].id : null;
    if (!defaultEvaluatorId) return;
    // If state still matches the same language, set evaluator
    const currentLanguageId: string | null = yield select(
      (s: OverallState) => s.languageDirectory.selectedLanguageId
    );
    if (currentLanguageId !== languageId) return;
    yield put(actions.setSelectedEvaluator(defaultEvaluatorId));
  }
});

export default LanguageDirectorySaga;


