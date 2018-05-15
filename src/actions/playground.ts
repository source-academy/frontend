import { Action, ActionCreator } from 'redux'

export const UPDATE_EDITOR_VALUE: string = 'UPDATE_EDITOR_VALUE'

export interface IUpdateEditorValue extends Action {
  type: string
  newEditorValue: string
}

export const updateEditorValue: ActionCreator<IUpdateEditorValue> = (newEditorValue: string) => ({
  type: UPDATE_EDITOR_VALUE,
  newEditorValue
})
