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
  InterpreterOutput,
  IPlaygroundState,
  ResultOutput
} from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  let newOutput: InterpreterOutput[]
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
      newOutput = state.output.concat(action.payload as CodeOutput)
      return {
        ...state,
        output: newOutput
      }
    case EVAL_INTERPRETER_SUCCESS:
      newOutput = state.output.concat(action.payload as ResultOutput)
      return {
        ...state,
        output: newOutput
      }
    case EVAL_INTERPRETER_ERROR:
      newOutput = state.output.concat(action.payload as ErrorOutput)
      return {
        ...state,
        output: newOutput
      }
    default:
      return state
  }
}
