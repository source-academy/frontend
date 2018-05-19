import { Reducer } from 'redux'
import {
  CLEAR_REPL,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  IAction,
  UPDATE_EDITOR_VALUE,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { defaultPlayground, InterpreterOutput, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  let outputClone
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
    case CLEAR_REPL:
      return {
        ...state,
        replValue: ''
      }
    case EVAL_INTERPRETER_SUCCESS:
      outputClone = state.output.slice(0)
      outputClone.push(action.payload as InterpreterOutput)
      return {
        ...state,
        output: outputClone
      }
    case EVAL_INTERPRETER_ERROR:
      outputClone = state.output.slice(0)
      outputClone.push(action.payload as InterpreterOutput)
      return {
        ...state,
        output: outputClone
      }
    default:
      return state
  }
}
