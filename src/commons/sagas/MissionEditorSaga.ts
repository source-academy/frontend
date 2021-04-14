import { SagaIterator } from 'redux-saga';
import { takeLatest } from 'redux-saga/effects';

import { BROWSE_MY_MISSIONS } from '../../features/missionEditor/MissionEditorTypes';

export function* MissionEditorSaga(): SagaIterator {
  yield takeLatest(BROWSE_MY_MISSIONS, browseMissionSaga);
}

function* browseMissionSaga() {}
