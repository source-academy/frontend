import { Action, ActionCreator } from 'redux'

export type UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE'
const UPDATE_EDITOR_VALUE: UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE'
export interface IUpdateEditorValue extends Action {
  type: UPDATE_EDITOR_VALUE
  newEditorValue: string
}
export const updateEditorValue: ActionCreator<IUpdateEditorValue> = (newEditorValue: string) => ({
  UPDATE_EDITOR_VALUE,
  newEditorValue
})
