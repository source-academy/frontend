import { Reducer } from 'redux'

import {
  CHANGE_ACTIVE_TAB,
  CHANGE_CHAPTER,
  CHANGE_EDITOR_WIDTH,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_CONTEXT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  END_INTERRUPT_EXECUTION,
  EVAL_EDITOR,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_REPL,
  HANDLE_CONSOLE_LOG,
  IAction,
  RESET_ASSESSMENT_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_VALUE,
  UPDATE_GRADING_COMMENTS_VALUE,
  UPDATE_GRADING_XP,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { WorkspaceLocation, WorkspaceLocations } from '../actions/workspaces'
import { createContext } from '../utils/slangHelper'
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultComments,
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
          sideContentActiveTab: action.payload.activeTab
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
          context: createContext<WorkspaceLocation>(
            state[location].context.chapter,
            undefined,
            location
          )
        }
      }
    case CHANGE_CHAPTER:
      return {
        ...state,
        [location]: {
          ...state[location],
          context: createContext<WorkspaceLocation>(action.payload.newChapter, undefined, location)
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
          consoleLogs: [action.payload.logString]
        })
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload.logString)
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
    case END_INTERRUPT_EXECUTION:
      /** 
       * Called to force a state change, which
       * will cause a re-render
       */
      return {
        ...state,
      }
    case RESET_ASSESSMENT_WORKSPACE:
      return {
        ...state,
        assessment: createDefaultWorkspace(WorkspaceLocations.assessment),
        gradingCommentsValue: defaultComments,
        gradingXP: undefined
      }
    case UPDATE_CURRENT_ASSESSMENT_ID:
      return {
        ...state,
        currentAssessment: action.payload.assessmentId,
        currentQuestion: action.payload.questionId,
        currentSubmission: undefined
      }
    case UPDATE_CURRENT_SUBMISSION_ID:
      return {
        ...state,
        currentAssessment: undefined,
        currentQuestion: action.payload.questionId,
        currentSubmission: action.payload.submissionId
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
    case UPDATE_GRADING_COMMENTS_VALUE:
      return {
        ...state,
        gradingCommentsValue: action.payload
      }
    case UPDATE_GRADING_XP:
      return {
        ...state,
        gradingXP: action.payload
      }
    default:
      return state
  }
}
