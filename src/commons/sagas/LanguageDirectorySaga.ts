import { languages } from '@sourceacademy/language-directory';
import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import { getEvaluatorDefinition } from '@sourceacademy/language-directory/dist/util';
import { call, fork, put, select } from 'redux-saga/effects';
import { selectConductorEnable } from 'src/features/conductor/flagConductorEnable';
import { selectDirectoryLanguageUrl } from 'src/features/directory/flagDirectoryLanguageUrl';

import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import type { LanguageDirectoryState } from '../../features/directory/LanguageDirectoryTypes';
import type { OverallState } from '../application/ApplicationTypes';
import { defaultEditorValue } from '../application/ApplicationTypes';
import { combineSagaHandlers } from '../redux/utils';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { preloadConductorEvaluatorSaga } from './helpers/conductorEvaluatorCache';

export function* getLanguageDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory,
  );
  if (!directory.selectedLanguageId) {
    return undefined;
  }
  return directory.languageMap[directory.selectedLanguageId];
}

export function* getEvaluatorDefinitionSaga() {
  const directory: LanguageDirectoryState = yield select(
    (state: OverallState) => state.languageDirectory,
  );
  if (!directory.selectedEvaluatorId) {
    return undefined;
  }
  const language: ILanguageDefinition = yield call(getLanguageDefinitionSaga);
  if (!language) {
    return undefined;
  }
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
    const url: string = yield select(selectDirectoryLanguageUrl);
    const defaultUrl = 'https://source-academy.github.io/language-directory/directory.json';
    let result: ILanguageDefinition[];
    if (url === defaultUrl) {
      result = yield call(() => Promise.resolve(languages));
    } else {
      const response = yield call(fetch, url);
      if (!response.ok) {
        throw new Error(`Can't retrieve language directory: ${response.status}`);
      }
      result = yield call([response, 'json']);
    }
    yield put(LanguageDirectoryActions.setLanguages(result));
  },
  [LanguageDirectoryActions.setSelectedEvaluator.type]: function* () {
    const evaluator = yield call(getEvaluatorDefinitionSaga);

    // Set the evaluator's default editor program when switching evaluators, but only while the
    // editor still holds the untouched default (never clobber code the user has written).
    if (evaluator?.defaultProgram != null) {
      const playground = yield select((state: OverallState) => state.workspaces.playground);
      const activeTabIndex: number = playground.activeEditorTabIndex ?? 0;
      const editorValue: string = playground.editorTabs[activeTabIndex]?.value ?? '';
      if (editorValue === defaultEditorValue) {
        yield put(
          WorkspaceActions.updateEditorValue(
            'playground',
            activeTabIndex,
            evaluator.defaultProgram,
          ),
        );
      }
    }

    // Preload the conductor for the *newly selected* evaluator, so a subsequent Run uses this
    // evaluator (not the language default). Without this, picking e.g. the Stepper evaluator would
    // never update the prepared conductor — the run would keep using the default evaluator, so
    // `hostLoadPlugin("stepper")` would never fire and the Stepper tab would never appear.
    const conductorEnabled: boolean = yield select(selectConductorEnable);
    if (!conductorEnabled) {
      return;
    }
    if (!evaluator?.path) {
      return;
    }

    try {
      yield call(preloadConductorEvaluatorSaga, evaluator.path);
    } catch (error) {
      console.error('Failed to preload:', error);
    }
  },
  [LanguageDirectoryActions.setSelectedLanguage.type]: function* () {
    // Selecting a language defaults its evaluator to the first one. The actual conductor preload
    // happens in the setSelectedEvaluator handler above (this dispatch triggers it), so switching
    // evaluators afterwards re-preloads the correct one.
    const language = yield call(getLanguageDefinitionSaga);
    if (!language) {
      return;
    }
    if (language.evaluators.length > 0) {
      yield put(LanguageDirectoryActions.setSelectedEvaluator(language.evaluators[0].id));
    }
  },
});

function* LanguageDirectorySaga() {
  yield fork(languageDirectoryHandlers);
  yield put(LanguageDirectoryActions.fetchLanguages());
}

export default LanguageDirectorySaga;
