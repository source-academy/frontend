import { SagaIterator } from 'redux-saga';
import { call, takeEvery } from 'redux-saga/effects';

import { LOGIN } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { computeEndpointUrl } from '../utils/AuthHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';

export default function* LoginSaga(): SagaIterator {
  yield takeEvery(LOGIN, updateLoginHref);
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
