import { SagaIterator } from 'redux-saga'
import { takeEvery, select, call, put, take, race } from 'redux-saga/effects'
import { showWarningMessage } from '../notification'
import { IState } from '../reducers'

// import { Shape } from '../shape'
import { Context, createContext, runInContext, interrupt } from '../slang'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'

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

function* interpreterSaga(): SagaIterator {
  // let library = yield select((state: Shape) => state.config.library)
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*() {
    const code: string = yield select((state: IState) => state.playground.editorValue)
    // context = createContext(library.week, library.externals)
    context = createContext()
    yield* evalCode(code, context)
  })
}

function* mainSaga() {
  yield* interpreterSaga()
}

export default mainSaga
