import { Reducer } from 'redux'
import {
  EVAL_INTERPRETER_SUCCESS,
  ILoadedAction,
  UPDATE_EDITOR_VALUE
} from '../actions/actionTypes'
import { defaultPlayground, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (
  state = defaultPlayground,
  action: ILoadedAction
) => {
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
