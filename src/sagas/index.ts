import { compressToEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import { SagaIterator } from 'redux-saga'
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { IState } from '../reducers/states'
import { Context, interrupt, runInContext } from '../slang'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'
import { IVLE_API_KEY } from '../utils/secrets'

function* mainSaga() {
  yield* interpreterSaga()
  yield* loginSaga()
  yield* workspaceSaga()
}

function* interpreterSaga(): SagaIterator {
  // let library = yield select((state: Shape) => state.config.library)
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*() {
    const code: string = yield select((state: IState) => state.playground.editorValue)
    yield put(actions.clearContext())
    yield put(actions.clearReplOutput())
    context = yield select((state: IState) => state.playground.context)
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.EVAL_REPL, function*() {
    const code: string = yield select((state: IState) => state.playground.replValue)
    context = yield select((state: IState) => state.playground.context)
    yield put(actions.clearReplInput())
    yield put(actions.sendReplInputToOutput(code))
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const newChapter = parseInt((action as actionTypes.IAction).payload, 10)
    const oldChapter = yield select((state: IState) => state.playground.sourceChapter)
    if (newChapter !== oldChapter) {
      yield put(actions.changeChapter(newChapter))
      yield put(actions.clearContext())
      yield put(actions.clearReplOutput())
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`)
    }
  })
}

function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, function*() {
    const api = 'https://ivle.nus.edu.sg/api/login/'
    const key = IVLE_API_KEY
    const callback = `${window.location.protocol}//${window.location.hostname}/academy`
    window.location.href = `${api}?apikey=${key}&url=${callback}`
    yield undefined
  })
}

function* workspaceSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, function*() {
    const code = yield select((state: IState) => state.playground.editorValue)
    const lib = yield select((state: IState) => state.playground.sourceChapter)
    const newQueryString =
      code === ''
        ? undefined
        : qs.stringify({
            prgrm: compressToEncodedURIComponent(code),
            lib
          })
    yield put(actions.changeQueryString(newQueryString))
  })
}

function* evalCode(code: string, context: Context) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context),
    interrupted: take(actionTypes.INTERRUPT_EXECUTION)
  })
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value))
    } else {
      yield put(actions.evalInterpreterError(context.errors))
    }
  } else if (interrupted) {
    interrupt(context)
    yield call(showWarningMessage, 'Execution aborted by user')
  }
}

export default mainSaga
