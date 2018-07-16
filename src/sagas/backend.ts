import { delay, SagaIterator } from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { AssessmentCategories, IAssessmentOverview } from '../components/assessment/assessmentShape'
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
    const assessments = yield call(callAssessments, tokens.accessToken)
    yield put(actions.setTokens(tokens))
    yield put(actions.setRole(user.role))
    yield put(actions.setUsername(user.name))
    yield put(actions.updateAssessmentOverviews(assessments))
    yield delay(2000)
    yield history.push('/academy')
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
  interface IBackendAssessmentOverview extends IAssessmentOverview {
    type: 'contest' | 'mission' | 'path' | 'sidequest'
  }
  const assessmentOverviews = await authorizedGet('assessments', accessToken)
  return assessmentOverviews.map((overview: IBackendAssessmentOverview) => {
    switch (overview.type) {
      case 'contest':
        overview.category = AssessmentCategories.Contest
      case 'mission':
        overview.category = AssessmentCategories.Mission
      case 'path':
        overview.category = AssessmentCategories.Path
      case 'sidequest':
        overview.category = AssessmentCategories.Sidequest
      default:
        overview.category = AssessmentCategories.Sidequest
    }
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

export default backendSaga
