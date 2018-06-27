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
  RESET_ASSESSMENT_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_EDITOR_VALUE,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { WorkspaceLocation } from '../actions/workspaces'
import { createContext } from '../slang'
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  InterpreterOutput,
  IWorkspaceManagerState
} from './states'

/**
 * Takes in a IWorkspaceManagerState and maps it to a new state. The pre-conditions are that
 *   - There exists an IWorkspaceState in the IWorkspaceManagerState of the key `location`.
 *   - `location` is defined (and exists) as a property 'workspaceLocation' in the action's payload.
 */
export const reducer: Reducer<IWorkspaceManagerState> = (
  state = defaultWorkspaceManager,
  action: IAction
) => {
  const location: WorkspaceLocation =
    action.payload !== undefined ? action.payload.workspaceLocation : undefined
  let newOutput: InterpreterOutput[]
  let lastOutput: InterpreterOutput
  switch (action.type) {
    case CHANGE_ACTIVE_TAB:
      return {
        ...state,
        [location]: {
          ...state[location],
          sideContentActiveTab: action.payload
        }
      }
    case CHANGE_EDITOR_WIDTH:
      return {
        ...state,
        [location]: {
          ...state[location],
          editorWidth:
            (
              parseFloat(state[location].editorWidth.slice(0, -1)) + action.payload.widthChange
            ).toString() + '%'
        }
      }
    case CHANGE_QUERY_STRING:
      return {
        ...state,
        [location]: {
          ...state[location],
          queryString: action.payload.queryString
        }
      }
    case CHANGE_SIDE_CONTENT_HEIGHT:
      return {
        ...state,
        [location]: {
          ...state[location],
          sideContentHeight: action.payload.height
        }
      }
    case CLEAR_REPL_INPUT:
      return {
        ...state,
        [location]: {
          ...state[location],
          replValue: ''
        }
      }
    case CLEAR_REPL_OUTPUT:
      return {
        ...state,
        [location]: {
          ...state[location],
          output: []
        }
      }
    case CLEAR_CONTEXT:
      return {
        ...state,
        [location]: {
          ...state[location],
          context: createContext(state[location].sourceChapter)
        }
      }
    case CHANGE_CHAPTER:
      return {
        ...state,
        [location]: {
          ...state[location],
          sourceChapter: action.payload.newChapter
        }
      }
    case HANDLE_CONSOLE_LOG:
      /* Possible cases:
       * (1) state[location].output === [], i.e. state[location].output[-1] === undefined
       * (2) state[location].output[-1] is not RunningOutput
       * (3) state[location].output[-1] is RunningOutput */
      lastOutput = state[location].output.slice(-1)[0]
      if (lastOutput === undefined || lastOutput.type !== 'running') {
        newOutput = state[location].output.concat({
          type: 'running',
          consoleLogs: [action.payload.log]
        })
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload.log)
        }
        newOutput = state[location].output.slice(0, -1).concat(updatedLastOutput)
      }
      return {
        ...state,
        [location]: {
          ...state[location],
          output: newOutput
        }
      }
    case SEND_REPL_INPUT_TO_OUTPUT:
      // CodeOutput properties exist in parallel with workspaceLocation
      newOutput = state[location].output.concat(action.payload as CodeOutput)
      return {
        ...state,
        [location]: {
          ...state[location],
          output: newOutput
        }
      }
    case EVAL_EDITOR:
      return {
        ...state,
        [location]: {
          ...state[location],
          isRunning: true
        }
      }
    case EVAL_REPL:
      return {
        ...state,
        [location]: {
          ...state[location],
          isRunning: true
        }
      }
    case EVAL_INTERPRETER_SUCCESS:
      lastOutput = state[location].output.slice(-1)[0]
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state[location].output.slice(0, -1).concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: lastOutput.consoleLogs
        })
      } else {
        newOutput = state[location].output.concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: []
        })
      }
      return {
        ...state,
        [location]: {
          ...state[location],
          output: newOutput,
          isRunning: false
        }
      }
    case EVAL_INTERPRETER_ERROR:
      lastOutput = state[location].output.slice(-1)[0]
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state[location].output.slice(0, -1).concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: lastOutput.consoleLogs
        })
      } else {
        newOutput = state[location].output.concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: []
        })
      }
      return {
        ...state,
        [location]: {
          ...state[location],
          output: newOutput,
          isRunning: false
        }
      }
    case INTERRUPT_EXECUTION:
      return {
        ...state,
        [location]: {
          ...state[location],
          isRunning: false
        }
      }
    case RESET_ASSESSMENT_WORKSPACE:
      return {
        ...state,
        assessment: createDefaultWorkspace()
      }
    case UPDATE_CURRENT_ASSESSMENT_ID:
      return {
        ...state,
        currentAssessment: action.payload.assessmentId,
        currentQuestion: action.payload.questionId
      }
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        [location]: {
          ...state[location],
          editorValue: action.payload.newEditorValue
        }
      }
    case UPDATE_REPL_VALUE:
      return {
        ...state,
        [location]: {
          ...state[location],
          replValue: action.payload.newReplValue
        }
      }
    default:
      return state
  }
}
