import { SourceError, Value } from '../slang/types'
import * as actionTypes from './actionTypes'
import { WorkspaceLocation } from './workspace'

// TODO fix this immediately after location 
// is implemented completely
export const handleConsoleLog = (log: string, workspaceLocation: WorkspaceLocation = 'assessment') => ({
  type: actionTypes.HANDLE_CONSOLE_LOG,
  payload: { log, workspaceLocation }
})

export const evalInterpreterSuccess = (value: Value, workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_INTERPRETER_SUCCESS,
  payload: { type: 'result', value, workspaceLocation }
})

export const evalInterpreterError = (errors: SourceError[], workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_INTERPRETER_ERROR,
  payload: { type: 'errors', errors, workspaceLocation }
})

export const handleInterruptExecution = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.INTERRUPT_EXECUTION,
  payload: { workspaceLocation }
})
