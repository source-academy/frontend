import type { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';

import * as actions from '../sideContent/SideContentActions';
import {
  BEGIN_ALERT_SIDE_CONTENT,
  NOTIFY_PROGRAM_EVALUATED
} from '../sideContent/SideContentTypes';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export function* SideContentSaga(): SagaIterator {
  yield takeEvery(
    BEGIN_ALERT_SIDE_CONTENT,
    function* ({
      payload: { id, workspaceLocation }
    }: ReturnType<typeof actions.beginAlertSideContent>) {
      yield take(NOTIFY_PROGRAM_EVALUATED);
      yield put(actions.endAlertSideContent(id, workspaceLocation));
    }
  );
}
