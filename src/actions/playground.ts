import { ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

export const updateEditorValue: ActionCreator<actionTypes.IAction> = (newEditorValue: string) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: newEditorValue
})

export const updateReplValue: ActionCreator<actionTypes.IAction> = (newReplValue: string) => ({
  type: actionTypes.UPDATE_REPL_VALUE,
  payload: newReplValue
})

export const sendReplInputToOutput: ActionCreator<actionTypes.IAction> = (newOutput: string) => ({
  type: actionTypes.SEND_REPL_INPUT_TO_OUTPUT,
  payload: {
    type: 'code',
    value: newOutput
  }
})

export const evalEditor = () => ({
  type: actionTypes.EVAL_EDITOR
})

export const evalRepl = () => ({
  type: actionTypes.EVAL_REPL
})

export const clearReplInput = () => ({
  type: actionTypes.CLEAR_REPL_INPUT
})

export const clearReplOutput = () => ({
  type: actionTypes.CLEAR_REPL_OUTPUT
})

export const clearContext = () => ({
  type: actionTypes.CLEAR_CONTEXT
})
