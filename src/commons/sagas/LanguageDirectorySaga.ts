import { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { getEvaluatorDefinition } from '@sourceacademy/language-directory/dist/util';
import { call, fork, put, select } from 'redux-saga/effects';
import { selectDirectoryLanguageUrl } from 'src/features/directory/flagDirectoryLanguageUrl';

import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import { LanguageDirectoryState } from '../../features/directory/LanguageDirectoryTypes';
import type { OverallState } from '../application/ApplicationTypes';
import { combineSagaHandlers } from '../redux/utils';

export function* getLanguageDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory
  );
  if (!directory.selectedLanguageId) return undefined;
  return directory.languageMap[directory.selectedLanguageId];
}

export function* getEvaluatorDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory
  );
  if (!directory.selectedEvaluatorId) return undefined;
  const language: ILanguageDefinition = yield call(getLanguageDefinitionSaga);
  if (!language) return undefined;
  return getEvaluatorDefinition(language, directory.selectedEvaluatorId);
}

const languageDirectoryHandlers = combineSagaHandlers({
  [LanguageDirectoryActions.setLanguages.type]: function* () {
    const directory = yield select((state: OverallState) => state.languageDirectory);
    if (directory.languages.length > 0) {
      yield put(LanguageDirectoryActions.setSelectedLanguage(directory.languages[0].id));
    }
  },
  [LanguageDirectoryActions.fetchLanguages.type]: function* () {
    const url = yield select(selectDirectoryLanguageUrl);
    const response = yield call(fetch, url);
    if (!response.ok) {
      throw new Error(`Can't retrieve language directory: ${response.status}`);
    }
    const result: ILanguageDefinition[] = yield call([response, 'json']);
    yield put(LanguageDirectoryActions.setLanguages(result));
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* () {
    const language = yield call(getLanguageDefinitionSaga);
    if (!language) return;
    if (language.evaluators.length > 0) {
      yield put(LanguageDirectoryActions.setSelectedEvaluator(language.evaluators[0].id));
    }
  }
});

function* LanguageDirectorySaga() {
  yield fork(languageDirectoryHandlers);
  yield put(LanguageDirectoryActions.fetchLanguages());
}

export default LanguageDirectorySaga;
