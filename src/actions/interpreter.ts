import { SourceError, Value } from '../slang/types'
import * as actionTypes from './actionTypes'

export const handleConsoleLog = (log: string) => ({
  type: actionTypes.HANDLE_CONSOLE_LOG,
  payload: log
})

export const evalInterpreter = (code: string) => ({
  type: actionTypes.EVAL_INTERPRETER,
  payload: code
})

export const evalInterpreterSuccess = (val: Value) => ({
  type: actionTypes.EVAL_INTERPRETER_SUCCESS,
  payload: { type: 'result', value: val }
})

export const evalInterpreterError = (errors: SourceError[]) => ({
  type: actionTypes.EVAL_INTERPRETER_ERROR,
  payload: { type: 'errors', errors }
})

export const handleInterruptExecution = () => ({
  type: actionTypes.INTERRUPT_EXECUTION
})
