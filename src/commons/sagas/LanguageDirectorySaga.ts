import type { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import { staticLanguageDirectoryProvider } from 'src/commons/languageDirectory/provider';

import Actions from '../../features/languageDirectory/LanguageDirectoryActions';

function* resolveDefaultEvaluatorSaga(action: ReturnType<typeof Actions.setSelectedLanguage>): SagaIterator {
  try {
    const {
      payload: { languageId, evaluatorId }
    } = action;
    if (evaluatorId) return; // already explicitly set
    const language = yield call(staticLanguageDirectoryProvider.getLanguageById, languageId);
    if (!language) return;
    const defaultEvaluatorId: string | null = language.evaluators.length > 0 ? language.evaluators[0].id : null;
    if (!defaultEvaluatorId) return;
    // If state still matches the same language, set evaluator
    const currentLanguageId: string | null = yield select(
      (s: OverallState) => s.languageDirectory.selectedLanguageId
    );
    if (currentLanguageId !== languageId) return;
    yield put(Actions.setSelectedEvaluator(defaultEvaluatorId));
  } catch {
    // swallow
  }
}

export default function* LanguageDirectorySaga(): SagaIterator {
  yield takeEvery(Actions.setSelectedLanguage.type, resolveDefaultEvaluatorSaga);
}


