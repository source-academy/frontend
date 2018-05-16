import { SourceError, Value } from '../slang/types'
import * as actionTypes from './actionTypes'

export const evalInterpreter = (code: string) => ({
  type: actionTypes.EVAL_INTERPRETER,
  payload: code
})

export const evalInterpreterSuccess = (value: Value) => ({
  type: actionTypes.EVAL_INTERPRETER_SUCCESS,
  payload: value
})

export const evalInterpreterError = (errors: SourceError[]) => ({
  type: actionTypes.EVAL_INTERPRETER_ERROR,
  payload: errors
})
