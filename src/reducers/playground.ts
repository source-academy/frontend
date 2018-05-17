import { Action, Reducer } from 'redux'
import { IUpdateEditorValue } from '../actions'
import { UPDATE_EDITOR_VALUE } from '../actions/actionTypes'
import { Context, createContext } from '../slang'

export interface IPlaygroundState {
  editorValue: string
  context: Context
  output: string[]
}

/**
 * The default (initial) state of the `IPlaygroundState`
 */
export const defaultState: IPlaygroundState = {
  editorValue: '',
  context: createContext(),
  output: ['Default output text']
}

/**
 * The reducer for `IPlaygroundState`
 *
 * UPDATE_EDITOR_VALUE: Update the `editorValue` property
 */
export const reducer: Reducer<IPlaygroundState> = (state = defaultState, action: Action) => {
  switch (action.type) {
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        editorValue: (action as IUpdateEditorValue).payload
      }
    default:
      return state
  }
}
