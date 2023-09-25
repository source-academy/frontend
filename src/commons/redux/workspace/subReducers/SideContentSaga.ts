import { Action } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';

import { safeTakeEvery as takeEvery } from '../../utils/SafeEffects';
import { allWorkspaceActions } from '../AllWorkspacesRedux';

const isNotifyProgramEvaluated = (
  action: Action
): action is ReturnType<typeof allWorkspaceActions.notifyProgramEvaluated> =>
  action.type === allWorkspaceActions.notifyProgramEvaluated.type;

export default function* SideContentSaga(): SagaIterator {
  yield takeEvery(
    allWorkspaceActions.beginAlertSideContent,
    function* ({
      payload
    }) {
      yield take(
        (action: Action) =>
          isNotifyProgramEvaluated(action) && action.payload.location === payload.location
      );
      yield put(allWorkspaceActions.endAlertSideContent(payload.location, payload.payload));
    }
  );
}
