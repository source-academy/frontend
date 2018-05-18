import { Action, ActionCreator } from 'redux'
import * as actionTypes from './actionTypes'

/**
 * Represents an `Action` which updates the `editorValue` of a
 * `IPlaygroundState`
 * @property type           - Unique string identifier for this `Action`
 * @property newEditorValue - The new string value for `editorValue`
 */
export interface IUpdateEditorValue extends Action {
  payload: string
}

/**
 * An `ActionCreator` returning an `IUpdateEditorValue` `Action`
 * @param newEditorValue - The new string value for `editorValue`
 */
export const updateEditorValue: ActionCreator<IUpdateEditorValue> = (newEditorValue: string) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: newEditorValue
})

export const evalEditor = () => ({
  type: actionTypes.EVAL_EDITOR
})

export const evalRepl = () => ({
  type: actionTypes.EVAL_REPL
})