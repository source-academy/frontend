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

export const evalEditor = () => ({
  type: actionTypes.EVAL_EDITOR
})

export const evalRepl = () => ({
  type: actionTypes.EVAL_REPL
})
