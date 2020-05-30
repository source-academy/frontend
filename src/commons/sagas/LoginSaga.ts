import { SagaIterator } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';

import { LOGIN } from '../application/types/SessionTypes';
import Constants from '../utils/Constants';

export default function* LoginSaga(): SagaIterator {
  yield takeEvery(LOGIN, updateLoginHref);
}

function* updateLoginHref() {
  const apiLogin = 'https://luminus.nus.edu.sg/v2/auth/connect/authorize';
  const clientId = Constants.luminusClientID;
  const port = window.location.port === '' ? '' : `:${window.location.port}`;
  const callback = `${window.location.protocol}//${window.location.hostname}${port}/login`;
  window.location.href = `${apiLogin}?client_id=${clientId}&redirect_uri=${callback}&response_type=code&scope=profile`;
  yield undefined;
}
