import { Reducer } from 'redux'
import {
  CLEAR_CONTEXT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  HANDLE_CONSOLE_LOG,
  IAction,
  MAKE_RUNNING_OUTPUT,
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
  ResultOutput,
  RunningOutput
} from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  let newOutput: InterpreterOutput[]
  let lastOutput: RunningOutput
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
    case MAKE_RUNNING_OUTPUT:
      return {
        ...state,
        output: state.output.concat({
          type: 'running',
          consoleLogs: []
        } as RunningOutput)
      }
    case HANDLE_CONSOLE_LOG:
      lastOutput = state.output.slice(-1)[0] as RunningOutput
      if (lastOutput === undefined) {
        // if state.output is empty, initialise a new RunningOutput
        lastOutput = { type: 'running', consoleLogs: [] } as RunningOutput
      }
      lastOutput.consoleLogs = lastOutput.consoleLogs.concat(action.payload)
      newOutput = state.output.slice(0, -1).concat(lastOutput)
      return {
        ...state,
        output: newOutput
      }
    case SEND_REPL_INPUT_TO_OUTPUT:
      newOutput = state.output.concat(action.payload as CodeOutput)
      return {
        ...state,
        output: newOutput
      }
    case EVAL_INTERPRETER_SUCCESS:
      lastOutput = state.output.slice(-1)[0] as RunningOutput
      if (lastOutput === undefined) {
        // if state.output is empty, initialise a new RunningOutput
        lastOutput = { type: 'running', consoleLogs: [] } as RunningOutput
      }
      newOutput = state.output.slice(0, -1).concat({
        ...action.payload,
        consoleLogs: lastOutput.consoleLogs
      } as ResultOutput)
      return {
        ...state,
        output: newOutput
      }
    case EVAL_INTERPRETER_ERROR:
      lastOutput = state.output.slice(-1)[0] as RunningOutput
      if (lastOutput === undefined) {
        // if state.output is empty, initialise a new RunningOutput
        lastOutput = { type: 'running', consoleLogs: [] } as RunningOutput
      }
      newOutput = state.output.slice(0, -1).concat({
        ...action.payload,
        consoleLogs: lastOutput.consoleLogs
      } as ErrorOutput)
      return {
        ...state,
        output: newOutput
      }
    default:
      return state
  }
}
