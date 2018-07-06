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
      body: JSON.stringify({ login: { ivle_token: ivleToken } })
    })
    const tokens = {
      accessToken: resp.refresh_token,
      refreshToken: resp.access_token
    }
    const username = yield call(() => 'IVLE USER') // TODO: fetchUsername
    yield put(actions.setTokens(tokens))
    yield put(actions.setUsername(username))
    yield delay(2000)
    yield history.push('/academy')
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
