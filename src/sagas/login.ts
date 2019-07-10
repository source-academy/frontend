import { SagaIterator } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import * as actionTypes from '../actions/actionTypes';
import { LUMINUS_CLIENT_ID } from '../utils/constants';

export default function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, updateLoginHref);
}

function* updateLoginHref() {
  const apiLogin = 'https://luminus.nus.edu.sg/v2/auth/connect/authorize';
  const clientId = LUMINUS_CLIENT_ID;
  const port = window.location.port === '' ? '' : `:${window.location.port}`;
  const callback = `${window.location.protocol}//${window.location.hostname}${port}/login`;
  window.location.href = `${apiLogin}?client_id=${clientId}&redirect_uri=${callback}&response_type=code&scope=profile`;
  yield undefined;
}
