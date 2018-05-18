import { Action, ActionCreator } from 'redux'

/**
 * The `type` attribute for an `Action` which updates the `IPlaygroundState`
 * `editorValue`
 */
export const UPDATE_EDITOR_VALUE = 'UPDATE_EDITOR_VALUE'

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
  type: UPDATE_EDITOR_VALUE,
  payload: newEditorValue
})
