import { Reducer } from 'redux'
import {
  EVAL_INTERPRETER_SUCCESS,
  IAction,
  UPDATE_EDITOR_VALUE,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { defaultPlayground, InterpreterOutput, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  switch (action.type) {
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        editorValue: action.payload
      }
    case UPDATE_REPL_VALUE:
      return {
        ...state,
        replValue: action.payload
      }
    case EVAL_INTERPRETER_SUCCESS:
      const outputClone = state.output.slice(0)
      outputClone.push(action.payload as InterpreterOutput)
      return {
        ...state,
        output: outputClone
      }
    default:
      return state
  }
}
