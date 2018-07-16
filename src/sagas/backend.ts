import { delay, SagaIterator } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { IAssessmentOverview } from '../components/assessment/assessmentShape'
import { IState } from '../reducers/states'
import { BACKEND_URL } from '../utils/constants'
import { history } from '../utils/history'

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const ivleToken = (action as actionTypes.IAction).payload
    const resp = yield call(callAuth, ivleToken)
    const tokens = {
      accessToken: resp.access_token,
      refreshToken: resp.refresh_token
    }
    const user = yield call(authorizedGet, 'user', tokens.accessToken)
    yield put(actions.setTokens(tokens))
    yield put(actions.setRole(user.role))
    yield put(actions.setUsername(user.name))
    yield delay(2000)
    yield history.push('/academy')
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const assessmentOverviews = yield call(callAssessments, accessToken)
    yield put(actions.updateAssessmentOverviews(assessmentOverviews))
  })
}

const callAuth = (ivleToken: string) =>
  request('auth', {
    method: 'POST',
    body: JSON.stringify({ login: { ivle_token: ivleToken } }),
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    })
  })

const callAssessments = async (accessToken: string) => {
  const assessmentOverviews: any = await authorizedGet('assessments', accessToken)
  return assessmentOverviews.map((overview: any) => {
    // backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
    //              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
    overview.category = capitalise(overview.type)
    delete overview.type
    return overview as IAssessmentOverview
  })
}

const authorizedGet = (path: string, accessToken: string) =>
  request(path, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    })
  })

const request = (path: string, opts: {}) =>
  fetch(`${BACKEND_URL}/v1/${path}`, opts)
    .then(data => data.json())
    .catch(_ => null)

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export default backendSaga
