import { delay, SagaIterator } from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { BACKEND_URL } from '../utils/constants'
import { history } from '../utils/history'

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const ivleToken = (action as actionTypes.IAction).payload
    const resp = yield call(request, 'auth', {
      method: 'POST',
      body: JSON.stringify({ login: { ivle_token: ivleToken } }),
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    })
    const tokens = {
      accessToken: resp.access_token,
      refreshToken: resp.refresh_token
    }
    const username = yield getUsername(tokens.accessToken)
    yield put(actions.setTokens(tokens))
    yield put(actions.setUsername(username))
    yield delay(2000)
    yield history.push('/academy')
  })
}

function* getUsername(accessToken: string) {
  const resp = yield call(request, 'user', {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    })
  })
  return resp.name
}

function request(path: string, opts: {}) {
  return fetch(`${BACKEND_URL}/v1/${path}`, opts)
    .then(data => data.json())
    .catch(err => err)
}

export default backendSaga
