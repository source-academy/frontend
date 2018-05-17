import { Reducer } from 'redux'
import {
  EVAL_INTERPRETER_SUCCESS,
  ILoadedAction,
  UPDATE_EDITOR_VALUE
} from '../actions/actionTypes'
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
export const reducer: Reducer<IPlaygroundState> = (state = defaultState, action: ILoadedAction) => {
  switch (action.type) {
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        editorValue: action.payload
      }
    case EVAL_INTERPRETER_SUCCESS:
      const outputClone = state.output.slice(0)
      outputClone.push(action.payload as string)
      return {
        ...state,
        output: outputClone
      }
    default:
      return state
  }
}
