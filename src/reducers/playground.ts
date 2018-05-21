import { Reducer } from 'redux'
import {
  CLEAR_CONTEXT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  IAction,
  SEND_REPL_INPUT_TO_OUTPUT,
  UPDATE_EDITOR_VALUE,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { createContext } from '../slang'
import {
  CodeOutput,
  defaultPlayground,
  ErrorOutput,
  IPlaygroundState,
  ResultOutput
} from './states'

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
    case CLEAR_REPL_INPUT:
      return {
        ...state,
        replValue: ''
      }
    case CLEAR_REPL_OUTPUT:
      return {
        ...state,
        output: []
      }
    case CLEAR_CONTEXT:
      return {
        ...state,
        context: createContext()
      }
    case SEND_REPL_INPUT_TO_OUTPUT:
      outputClone = state.output.slice(0)
      outputClone.push(action.payload as CodeOutput)
      return {
        ...state,
        output: outputClone
      }
    case EVAL_INTERPRETER_SUCCESS:
      outputClone = state.output.slice(0)
      outputClone.push(action.payload as ResultOutput)
      return {
        ...state,
        output: outputClone
      }
    case EVAL_INTERPRETER_ERROR:
      outputClone = state.output.slice(0)
      outputClone.push(action.payload as ErrorOutput)
      return {
        ...state,
        output: outputClone
      }
    default:
      return state
  }
}
