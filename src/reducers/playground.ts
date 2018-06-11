import { Reducer } from 'redux'
import {
  CHANGE_ACTIVE_TAB,
  CHANGE_CHAPTER,
  CHANGE_EDITOR_WIDTH,
  CHANGE_QUERY_STRING,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_CONTEXT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  EVAL_EDITOR,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_REPL,
  HANDLE_CONSOLE_LOG,
  IAction,
  INTERRUPT_EXECUTION,
  SEND_REPL_INPUT_TO_OUTPUT,
  UPDATE_EDITOR_VALUE,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { createContext } from '../slang'
import { CodeOutput, defaultPlayground, InterpreterOutput, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  let newOutput: InterpreterOutput[]
  let lastOutput: InterpreterOutput
  switch (action.type) {
    case CHANGE_ACTIVE_TAB:
      return {
        ...state,
        sideContentActiveTab: action.payload
      }
    case CHANGE_EDITOR_WIDTH:
      return {
        ...state,
        editorWidth: (parseFloat(state.editorWidth.slice(0, -1)) + action.payload).toString() + '%'
      }
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        queryString: action.payload
      }
    case CHANGE_SIDE_CONTENT_HEIGHT:
      return {
        ...state,
        sideContentHeight: action.payload
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
        context: createContext(state.sourceChapter)
      }
    case CHANGE_CHAPTER:
      return {
        ...state,
        sourceChapter: action.payload
      }
    case HANDLE_CONSOLE_LOG:
      /* Possible cases:
       * (1) state.output === [], i.e. state.output[-1] === undefined
       * (2) state.output[-1] is not RunningOutput
       * (3) state.output[-1] is RunningOutput */
      lastOutput = state.output.slice(-1)[0]
      if (lastOutput === undefined || lastOutput.type !== 'running') {
        newOutput = state.output.concat({
          type: 'running',
          consoleLogs: [action.payload]
        })
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload)
        }
        newOutput = state.output.slice(0, -1).concat(updatedLastOutput)
      }
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
    case EVAL_EDITOR:
      return {
        ...state,
        isRunning: true
      }
    case EVAL_REPL:
      return {
        ...state,
        isRunning: true
      }
    case EVAL_INTERPRETER_SUCCESS:
      lastOutput = state.output.slice(-1)[0]
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state.output.slice(0, -1).concat({
          ...action.payload,
          consoleLogs: lastOutput.consoleLogs
        })
      } else {
        newOutput = state.output.concat({
          ...action.payload,
          consoleLogs: []
        })
      }
      return {
        ...state,
        output: newOutput,
        isRunning: false
      }
    case EVAL_INTERPRETER_ERROR:
      lastOutput = state.output.slice(-1)[0]
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state.output.slice(0, -1).concat({
          ...action.payload,
          consoleLogs: lastOutput.consoleLogs
        })
      } else {
        newOutput = state.output.concat({
          ...action.payload,
          consoleLogs: []
        })
      }
      return {
        ...state,
        output: newOutput,
        isRunning: false
      }
    case INTERRUPT_EXECUTION:
      return {
        ...state,
        isRunning: false
      }
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
    default:
      return state
  }
}
