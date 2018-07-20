import { delay, SagaIterator } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { IState } from '../reducers/states'
import { history } from '../utils/history'
import { mockAssessmentOverviews, mockAssessments } from './assessmentAPI'
import { mockFetchGrading, mockFetchGradingOverview } from './gradingAPI'

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    }
    const user = {
      name: 'DevStaff',
      role: 'staff'
    }
    yield put(actions.setTokens(tokens))
    yield put(actions.setRole(user.role))
    yield put(actions.setUsername(user.name))
    yield delay(2000)
    yield history.push('/academy')
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    yield delay(2000)
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]))
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    yield delay(2000)
    const id = (action as actionTypes.IAction).payload
    const assessment = mockAssessments[id]
    yield put(actions.updateAssessment({ ...assessment }))
  })

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*() {
    yield delay(2000)
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const gradingOverviews = yield call(() => mockFetchGradingOverview(accessToken))
    if (gradingOverviews !== null) {
      yield put(actions.updateGradingOverviews([...gradingOverviews]))
    }
  })

  yield takeEvery(actionTypes.FETCH_GRADING, function*(action) {
    yield delay(2000)
    const submissionId = (action as actionTypes.IAction).payload
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId))
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, [...grading]))
    }
  })
}
