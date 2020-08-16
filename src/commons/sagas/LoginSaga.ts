import * as Sentry from '@sentry/browser';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import { LOG_OUT } from '../application/types/CommonsTypes';
import { LOGIN, SET_USER } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { computeEndpointUrl } from '../utils/AuthHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';
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
