import * as Sentry from '@sentry/browser';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import CommonsActions from '../application/actions/CommonsActions';
import SessionActions from '../application/actions/SessionActions';
import { actions } from '../utils/ActionsHelper';
import { computeEndpointUrl } from '../utils/AuthHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* LoginSaga(): SagaIterator {
  yield takeEvery(SessionActions.login.type, updateLoginHref);

  yield takeEvery(SessionActions.setUser.type, (action: ReturnType<typeof actions.setUser>) => {
    Sentry.setUser({ id: action.payload.userId.toString() });
  });

  yield takeEvery(CommonsActions.logOut.type, () => {
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
