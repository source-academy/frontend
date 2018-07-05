import { compressToEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import { SagaIterator } from 'redux-saga'
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { WorkspaceLocation } from '../actions/workspaces'
import { mockAssessmentOverviews, mockAssessments } from '../mocks/assessmentAPI'
import { mockFetchGrading, mockFetchGradingOverview } from '../mocks/gradingAPI'
import { MOCK_TRAINER_ACCESS_TOKEN } from '../mocks/userAPI'
import { defaultEditorValue, IState } from '../reducers/states'
import { Context, interrupt, runInContext } from '../slang'
import { IVLE_KEY } from '../utils/constants'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'

function* mainSaga() {
  yield* apiFetchSaga()
  yield* workspaceSaga()
  yield* loginSaga()
  yield* playgroundSaga()
}

function* apiFetchSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const newContent = mockAssessmentOverviews
    const oldContent = yield select((state: IState) => state.session.assessmentOverviews)
    if (newContent !== oldContent) {
      yield put(actions.updateAssessmentOverviews(newContent))
    }
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const id = (action as actionTypes.IAction).payload
    const newContent = mockAssessments[id]
    const oldContent = yield select((state: IState) => state.session.assessments[id])
    if (newContent !== oldContent) {
      yield put(actions.updateAssessment(newContent))
    }
  })

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*() {
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const gradingOverviews = yield call(() => mockFetchGradingOverview(accessToken))
    if (gradingOverviews !== null) {
      yield put(actions.updateGradingOverviews(gradingOverviews))
    }
  })

  yield takeEvery(actionTypes.FETCH_GRADING, function*(action) {
    const submissionId = (action as actionTypes.IAction).payload
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId))
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, grading))
    }
  })
}

function* workspaceSaga(): SagaIterator {
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const code: string = yield select((state: IState) => state.workspaces[location].editorValue)
    yield put(actions.clearContext(location))
    yield put(actions.clearReplOutput(location))
    context = yield select((state: IState) => state.workspaces[location].context)
    yield* evalCode(code, context, location)
  })

  yield takeEvery(actionTypes.EVAL_REPL, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const code: string = yield select((state: IState) => state.workspaces[location].replValue)
    context = yield select((state: IState) => state.workspaces[location].context)
    yield put(actions.clearReplInput(location))
    yield put(actions.sendReplInputToOutput(code, location))
    yield* evalCode(code, context, location)
  })

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const newChapter = parseInt((action as actionTypes.IAction).payload, 10)
    const oldChapter = yield select((state: IState) => state.workspaces[location].sourceChapter)
    if (newChapter !== oldChapter) {
      yield put(actions.changeChapter(newChapter, location))
      yield put(actions.clearContext(location))
      yield put(actions.clearReplOutput(location))
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`)
    }
  })
}

function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, function*() {
    const apiLogin = 'https://ivle.nus.edu.sg/api/login/'
    const key = IVLE_KEY
    const callback = `${window.location.protocol}//${window.location.hostname}/academy`
    window.location.href = `${apiLogin}?apikey=${key}&url=${callback}`
    yield undefined
  })

  yield takeEvery(actionTypes.FETCH_TOKENS, function*(action) {
    // TODO: use an API call to the backend; to retrieve access
    // and refresh tokens using the IVLE token (in the action payload)
    const tokens = yield call(() => ({
      accessToken: MOCK_TRAINER_ACCESS_TOKEN,
      refreshToken: 'R3FRE5H T0K4N'
    }))
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

function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, function*() {
    const code = yield select((state: IState) => state.workspaces.playground.editorValue)
    const lib = yield select((state: IState) => state.workspaces.playground.sourceChapter)
    const newQueryString =
      code === '' || code === defaultEditorValue
        ? undefined
        : qs.stringify({
            prgrm: compressToEncodedURIComponent(code),
            lib
          })
    yield put(actions.changeQueryString(newQueryString))
  })
}

function* evalCode(code: string, context: Context, location: WorkspaceLocation) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, { scheduler: 'preemptive' }),
    interrupted: take(actionTypes.INTERRUPT_EXECUTION)
  })
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value, location))
    } else {
      yield put(actions.evalInterpreterError(context.errors, location))
    }
  } else if (interrupted) {
    interrupt(context)
    yield call(showWarningMessage, 'Execution aborted by user')
  }
}

export default mainSaga
