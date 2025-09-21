import { call, put, select } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { flagConductorEnable } from 'src/features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from 'src/features/conductor/flagConductorEvaluatorUrl';
import { flagLanguageDirectoryEnable } from 'src/features/languageDirectory/flagLanguageDirectory';
import { selectLanguageDirectoryEnable } from 'src/features/languageDirectory/flagLanguageDirectory';
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
    const directoryEnabled = yield select(selectLanguageDirectoryEnable);
    if (!directoryEnabled) {
      return;
    }
    const langs = yield call(
      staticLanguageDirectoryProvider.getLanguages.bind(staticLanguageDirectoryProvider)
    );
    yield put(LanguageDirectoryActions.setLanguages(langs));
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* (action) {
    const {
      payload: { languageId, evaluatorId }
    } = action;
    const language = yield call(
      staticLanguageDirectoryProvider.getLanguageById.bind(staticLanguageDirectoryProvider),
      languageId
    );
    if (!language) return;
    console.log('A LanguageDirectorySaga: language', language);
    // If evaluatorId is explicitly provided, use it; otherwise use the first available
    const targetEvaluatorId =
      evaluatorId || (language.evaluators.length > 0 ? language.evaluators[0].id : null);
    console.log('B LanguageDirectorySaga: targetEvaluatorId', targetEvaluatorId);
    if (!targetEvaluatorId) return;

    yield put(actions.setSelectedEvaluator(targetEvaluatorId));
  },
  [LanguageDirectoryActions.setSelectedEvaluator.type]: function* (action) {
    const {
      payload: { evaluatorId }
    } = action;
    const selectedLanguageId: string | null = yield select(
      (s: OverallState) => s.languageDirectory.selectedLanguageId
    );
    console.log('C LanguageDirectorySaga: selectedLanguageId', selectedLanguageId);
    // Only proceed if we have both a language and evaluator ID
    if (!selectedLanguageId || !evaluatorId) return;
    const evaluator = yield call(
      staticLanguageDirectoryProvider.getEvaluatorDefinition.bind(staticLanguageDirectoryProvider),
      selectedLanguageId,
      evaluatorId
    );
    console.log('D LanguageDirectorySaga: evaluator', evaluator);
    if (!evaluator) return;
    // Set conductor enable and evaluator url to true and the evaluator path
    yield put(actions.setFlag({ featureFlag: flagConductorEnable, value: true }));
    yield put(actions.setFlag({ featureFlag: flagConductorEvaluatorUrl, value: evaluator.path }));
  },
  [LanguageDirectoryActions.resetConductor.type]: function* () {
    // Reset languageDirectory in state

    // Reset conductor flags to their default values
    yield put(actions.resetFlag({ featureFlag: flagConductorEnable }));
    yield put(actions.resetFlag({ featureFlag: flagConductorEvaluatorUrl }));
  },
  [actions.setFlag.type]: {
    takeEvery: function* (action) {
      const {
        payload: { featureFlag, value }
      } = action as any;
      if (featureFlag.flagName !== flagLanguageDirectoryEnable.flagName) return;
      if (value) {
        // Auto-fetch languages when enabling the language directory
        const currentLanguages = yield select((s: OverallState) => s.languageDirectory.languages);
        if (currentLanguages.length === 0) {
          yield put(LanguageDirectoryActions.fetchLanguages());
        }
      } else {
        // Reset conductor settings when disabling the language directory
        yield put(LanguageDirectoryActions.resetConductor());
      }
    }
  }
});

export default LanguageDirectorySaga;
