import { SagaIterator } from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { BACKEND_URL } from '../utils/constants'

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_TOKENS, function*(action) {
    const ivleToken = (action as actionTypes.IAction).payload
    const resp = yield call(request, 'auth', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ login: { ivle_token: ivleToken } })
    })
    const tokens = {
      accessToken: resp.refresh_token,
      refreshToken: resp.access_token
    }
    yield put(actions.setTokens(tokens))
  })

  yield takeEvery(actionTypes.FETCH_USERNAME, function*() {
    // TODO: use an API call to the backend; an api call to IVLE raises an
    // uncaught error due to restrictive Access-Control-Allow-Origin headers,
    // causing the staging server to bug out
    const username = yield call(() => 'IVLE USER')
    yield put(actions.setUsername(username))
  })
}

function request(path: string, opts: {}) {
  const defaultOpts = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }
  const requestOpts = { ...defaultOpts, ...opts }
  return fetch(`${BACKEND_URL}/v1/${path}`, requestOpts)
    .then(data => data.json())
    .catch(err => err)
}

export default backendSaga
