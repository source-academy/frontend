import { Context, interrupt, runInContext } from 'js-slang'
import { InterruptedError } from 'js-slang/dist/interpreter-errors'
import { compressToEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import { SagaIterator } from 'redux-saga'
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { WorkspaceLocation } from '../actions/workspaces'
import { ExternalLibraryNames } from '../components/assessment/assessmentShape'
import { mockBackendSaga } from '../mocks/backend'
import { externalLibraries } from '../reducers/externalLibraries'
import { defaultEditorValue, IState } from '../reducers/states'
import { IVLE_KEY, USE_BACKEND } from '../utils/constants'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'
import backendSaga from './backend'

function* mainSaga() {
  yield* USE_BACKEND ? backendSaga() : mockBackendSaga()
  yield* workspaceSaga()
  yield* loginSaga()
  yield* playgroundSaga()
}

function* workspaceSaga(): SagaIterator {
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const code: string = yield select((state: IState) => state.workspaces[location].editorValue)
    const chapter: number = yield select(
      (state: IState) => state.workspaces[location].context.chapter
    )
    const externals: string[] = yield select(
      (state: IState) => state.workspaces[location].externals
    )
    const globals: Array<[string, any]> = yield select(
      (state: IState) => state.workspaces[location].globals
    )
    /** End any code that is running right now. */
    yield put(actions.beginInterruptExecution(location))
    /** Clear the context, with the same chapter and externals as before. */
    yield put(actions.clearContext(chapter, externals, globals, ExternalLibraryNames.NONE, location))
    yield put(actions.clearReplOutput(location))
    context = yield select((state: IState) => state.workspaces[location].context)
    yield* evalCode(code, context, location)
  })

  yield takeEvery(actionTypes.EVAL_REPL, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const code: string = yield select((state: IState) => state.workspaces[location].replValue)
    yield put(actions.beginInterruptExecution(location))
    yield put(actions.clearReplInput(location))
    yield put(actions.sendReplInputToOutput(code, location))
    context = yield select((state: IState) => state.workspaces[location].context)
    yield* evalCode(code, context, location)
  })

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const newChapter = (action as actionTypes.IAction).payload.chapter
    const oldChapter = yield select((state: IState) => state.workspaces[location].context.chapter)
    const externals: string[] = yield select(
      (state: IState) => state.workspaces[location].externals
    )
    const globals: Array<[string, any]> = yield select(
      (state: IState) => state.workspaces[location].globals
    )
    if (newChapter !== oldChapter) {
      yield put(actions.clearContext(newChapter, externals, globals, ExternalLibraryNames.NONE, location))
      yield put(actions.clearReplOutput(location))
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
    }
  })

  /**
   * Note that the PLAYGROUND_EXTERNAL_SELECT action is made to
   * select the library for playground.
   * This is because assessments do not have a chapter & library select, the question
   * specifies the chapter and library to be used.
   *
   * To abstract this to assessments, the state structure must be manipulated to store
   * the external library name in a IWorkspaceState (as compared to IWorkspaceManagerState).
   *
   * @see IWorkspaceManagerState @see IWorkspaceState
   */
  yield takeEvery(actionTypes.PLAYGROUND_EXTERNAL_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.workspaceLocation
    const chapter = yield select((state: IState) => state.workspaces[location].context.chapter)
    const globals: Array<[string, any]> = yield select(
      (state: IState) => state.workspaces[location].globals
    )
    const newExternal = (action as actionTypes.IAction).payload.external
    const oldExternal = yield select(
      (state: IState) => state.workspaces.playground.playgroundExternal
    )
    if (newExternal !== oldExternal) {
      const externals = externalLibraries.get(newExternal)!
      yield put(actions.changePlaygroundExternal(newExternal))
      yield put(actions.clearContext(chapter, externals, globals, newExternal, location))
      yield put(actions.clearReplOutput(location))
      yield call(showSuccessMessage, `Switched to ${newExternal} library`, 1000)
    }
  })

  /**
   * Handles the side effect of resetting the WebGL context when context is reset.
   *
   * @see clearContext and files under 'public/externalLibs/graphics'
   */
  yield takeEvery(actionTypes.CLEAR_CONTEXT, function*(action) {
    const externalLibraryName = (action as actionTypes.IAction).payload.externalLibraryName
    const resetWebGl = (window as any).getReadyWebGLForCanvas
    switch (externalLibraryName) {
      case ExternalLibraryNames.TWO_DIM_RUNES:
        resetWebGl('2d')
        break
      case ExternalLibraryNames.THREE_DIM_RUNES:
        resetWebGl('3d')
        break
      case ExternalLibraryNames.CURVES:
        resetWebGl('curve')
        break
    }
    const globals: Array<[string, any]> = (action as actionTypes.IAction).payload.globals
    for (const [key, value] of globals) {
      window[key] = value
    }
    yield undefined
  })

  yield takeEvery(actionTypes.SAVE_GRADING_INPUT, function*(action) {
    // TODO api call here
    yield call(showSuccessMessage, 'Saved grading', 1000)
  })
}

function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, function*() {
    const apiLogin = 'https://ivle.nus.edu.sg/api/login/'
    const key = IVLE_KEY
    const callback = `${window.location.protocol}//${window.location.hostname}/login`
    window.location.href = `${apiLogin}?apikey=${key}&url=${callback}`
    yield undefined
  })
}

function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, function*() {
    const code = yield select((state: IState) => state.workspaces.playground.editorValue)
    const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter)
    const newQueryString =
      code === '' || code === defaultEditorValue
        ? undefined
        : qs.stringify({
            prgrm: compressToEncodedURIComponent(code),
            lib: chapter
          })
    yield put(actions.changeQueryString(newQueryString))
  })
}

function* evalCode(code: string, context: Context, location: WorkspaceLocation) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, { scheduler: 'preemptive' }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(actionTypes.BEGIN_INTERRUPT_EXECUTION)
  })
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value, location))
    } else {
      yield put(actions.evalInterpreterError(context.errors, location))
    }
  } else if (interrupted) {
    interrupt(context)
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]))
    yield put(actions.endInterruptExecution(location))
    yield call(showWarningMessage, 'Execution aborted by user', 750)
  }
}

export default mainSaga
