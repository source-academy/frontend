import * as Sentry from '@sentry/browser';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { LOG_OUT } from 'src/commons/application/types/CommonsTypes';
import { LOGIN, SET_USER } from 'src/commons/application/types/SessionTypes';
import { actions } from 'src/commons/utils/ActionsHelper';
import { computeEndpointUrl } from 'src/commons/utils/AuthHelper';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* LoginSaga(): SagaIterator {
  yield takeEvery(LOGIN, updateLoginHref);

  yield takeEvery(SET_USER, (action: ReturnType<typeof actions.setUser>) => {
    Sentry.setUser({ id: action.payload.userId.toString() });
  });

  yield takeEvery(LOG_OUT, () => {
    Sentry.setUser(null);
  });
}

function* updateLoginHref({ payload: providerId }: ReturnType<typeof actions.login>) {
  const epUrl = computeEndpointUrl(providerId);
  if (!epUrl) {
    yield call(showWarningMessage, 'Could not log in; invalid provider name provided.');
    return undefined;
  }
  window.location.href = epUrl;
  return undefined;
}
