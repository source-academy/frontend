import { delay, SagaIterator } from 'redux-saga'
import { put, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { history } from '../utils/history'
import { mockAssessmentOverviews, mockAssessments } from './assessmentAPI'

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    }
    const user = {
      name: 'DevStudent',
      role: 'student'
    }
    yield put(actions.setTokens(tokens))
    yield put(actions.setRole(user.role))
    yield put(actions.setUsername(user.name))
    yield delay(2000)
    yield history.push('/academy')
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    yield put(actions.updateAssessmentOverviews(mockAssessmentOverviews))
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const id = (action as actionTypes.IAction).payload
    const assessment = mockAssessments[id]
    yield put(actions.updateAssessment(assessment))
  })
}
