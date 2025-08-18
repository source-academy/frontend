import { call, put, select } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { flagConductorEnable } from 'src/features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from 'src/features/conductor/flagConductorEvaluatorUrl';
import { staticLanguageDirectoryProvider } from 'src/features/languageDirectory/LanguageDirectoryTypes';

import LanguageDirectoryActions from '../../features/languageDirectory/LanguageDirectoryActions';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';

const LanguageDirectorySaga = combineSagaHandlers({
  [LanguageDirectoryActions.setLanguages.type]: function* () {
    const state = yield select((s: OverallState) => s.languageDirectory);
    if (state.selectedLanguageId === null && state.languages.length > 0) {
      yield put(actions.setSelectedLanguage(state.languages[0].id));
    }
    if (state.selectedEvaluatorId === null && state.languages.length > 0) {
      yield put(actions.setSelectedEvaluator(state.languages[0].evaluators[0].id));
    }
  },
  [LanguageDirectoryActions.fetchLanguages.type]: function* () {
    const langs = yield call(
      staticLanguageDirectoryProvider.getLanguages.bind(staticLanguageDirectoryProvider)
    );
    yield put(actions.setLanguages(langs));
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* (action) {
    const {
      payload: { languageId, evaluatorId }
    } = action;
    if (evaluatorId) return; // already explicitly set
    const language = yield call(
      staticLanguageDirectoryProvider.getLanguageById.bind(staticLanguageDirectoryProvider),
      languageId
    );
    if (!language) return;
    const defaultEvaluatorId: string | null =
      language.evaluators.length > 0 ? language.evaluators[0].id : null;
    if (!defaultEvaluatorId) return;
    // If state still matches the same language, set evaluator
    const currentLanguageId: string | null = yield select(
      (s: OverallState) => s.languageDirectory.selectedLanguageId
    );
    if (currentLanguageId !== languageId) return;
    yield put(actions.setSelectedEvaluator(defaultEvaluatorId));
  },
  [LanguageDirectoryActions.setSelectedEvaluator.type]: function* (action) {
    const {
      payload: { evaluatorId }
    } = action;
    const selectedLanguageId: string | null = yield select(
      (s: OverallState) => s.languageDirectory.selectedLanguageId
    );
    if (!selectedLanguageId) return;
    const evaluator = yield call(
      staticLanguageDirectoryProvider.getEvaluatorDefinition.bind(staticLanguageDirectoryProvider),
      selectedLanguageId,
      evaluatorId
    );
    if (!evaluator) return;
    yield put(actions.setFlag({ featureFlag: flagConductorEnable, value: true }));
    yield put(actions.setFlag({ featureFlag: flagConductorEvaluatorUrl, value: evaluator.path }));
  }
});

export default LanguageDirectorySaga;
