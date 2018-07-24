import { delay, SagaIterator } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { IAssessment, IAssessmentOverview, IQuestion } from '../components/assessment/assessmentShape'
import { IState } from '../reducers/states'
import { BACKEND_URL } from '../utils/constants'
import { history } from '../utils/history'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const ivleToken = (action as actionTypes.IAction).payload
    const resp = yield call(postAuth, ivleToken)
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
    const assessmentOverviews = yield call(getAssessmentOverviews, accessToken)
    yield put(actions.updateAssessmentOverviews(assessmentOverviews))
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const id = (action as actionTypes.IAction).payload
    const assessment: IAssessment = yield call(getAssessment, id, accessToken)
    // TODO remove parsing once backend/#162 is resolved.
    assessment.questions = assessment.questions
      .map(q => {
        if (q.type === 'mcq' && q.answer !== null) {
          q.answer = parseInt(q.answer.toString(), 10)
        }
        return q
      })
    yield put(actions.updateAssessment(assessment))
  })

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(action) {
    const accessToken = yield select((state: IState) => state.session.accessToken)
    const questionId = (action as actionTypes.IAction).payload.id
    const answer = (action as actionTypes.IAction).payload.answer
    const resp = yield postAnswer(questionId, accessToken, answer)
    if (resp !== null && resp.ok) {
      yield call(showSuccessMessage, 'Saved!', 1000)
      // Now, update the answer for the question in the assessment in the store
      const assessmentId = yield select(
        (state: IState) => state.workspaces.assessment.currentAssessment!
      )
      const assessment = yield select((state: IState) =>
        state.session.assessments.get(assessmentId)
      )
      const newQuestions = assessment.questions.slice().map((question: IQuestion) => {
        if (question.id === questionId) {
          question.answer = answer
        }
        return question
      })
      const newAssessment = {
        ...assessment,
        questions: newQuestions
      }
      yield put(actions.updateAssessment(newAssessment))
    } else if (resp !== null) {
      let errorMessage: string
      switch (resp.status) {
        case 403:
          errorMessage = 'Got 403 response. Only students can save assessment answers.'
          break
        case 400:
          errorMessage = "Can't save an empty answer."
          break
        default:
          errorMessage = `Something went wrong (got ${resp.status} response)`
          break
      }
      yield call(showWarningMessage, errorMessage)
    } else {
      // postAnswer returns null for failed fetch
      yield call(showWarningMessage, "Couldn't reach our servers. Are you online?")
    }
  })
}

/**
 * POST /auth
 * @returns {Object} with string properties accessToken & refreshToken
 */
const postAuth = (ivleToken: string) =>
  request('auth', {
    method: 'POST',
    body: JSON.stringify({ login: { ivle_token: ivleToken } }),
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    })
  })

/**
 * GET /assessments
 * @returns {Array} IAssessmentOverview[]
 */
const getAssessmentOverviews = async (accessToken: string) => {
  const assessmentOverviews: any = await authorizedGet('assessments', accessToken)
  return assessmentOverviews.map((overview: any) => {
    // backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
    //              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
    overview.category = capitalise(overview.type)
    delete overview.type
    return overview as IAssessmentOverview
  })
}

/**
 * GET /assessments/${assessmentId}
 * @returns {IAssessment}
 */
const getAssessment = async (id: number, accessToken: string) => {
  const assessment: any = await authorizedGet(`assessments/${id}`, accessToken)
  assessment.category = capitalise(assessment.type)
  delete assessment.type
  return assessment
}

/** POST /assessments/question/${questionId}/submit
 */
const postAnswer = async (id: number, accessToken: string, answer: string | number) => {
  const resp = await authorizedPost(`assessments/question/${id}/submit`, accessToken, {
    answer: `${answer}`
  })
  return resp
}

/**
 * Makes a GET request to given path with appropriate JWT from accessToken
 */
const authorizedGet = (path: string, accessToken: string) =>
  request(path, {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    })
  })

/**
 * Makes a POST request to given path with appropriate JWT from accessToken,
 * and application/json body from data
 */
const authorizedPost = (path: string, accessToken: string, data: object) =>
  requestAnyResponse(path, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    })
  })

/**
 * Makes a request, but does not try to decode the response as a JSON object
 */
const requestAnyResponse = (path: string, opts: {}) =>
  fetch(`${BACKEND_URL}/v1/${path}`, opts)
    .then(data => data)
    .catch(error => null)

/**
 * Makes a request and returns the response body decoded as a JSON object
 */
const request = (path: string, opts: {}) =>
  fetch(`${BACKEND_URL}/v1/${path}`, opts)
    .then(data => data.json())
    .catch(error => error)

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export default backendSaga
