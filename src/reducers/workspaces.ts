import { Reducer } from 'redux'

import {
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_ACTIVE_TAB,
  CHANGE_EDITOR_WIDTH,
  CHANGE_PLAYGROUND_EXTERNAL,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_CONTEXT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  END_INTERRUPT_EXECUTION,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
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
 * Takes in a IWorkspaceManagerState and maps it to a new state. The
 * pre-conditions are that
 *   - There exists an IWorkspaceState in the IWorkspaceManagerState of the key
 *     `location`.
 *   - `location` is defined (and exists) as a property 'workspaceLocation' in
 *     the action's payload.
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
    case BROWSE_REPL_HISTORY_DOWN:
      if (state[location].replHistory.isBrowsingIndex === null) {
        // Not yet started browsing history, nothing to do
        return state
      } else if (state[location].replHistory.isBrowsingIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state[location].replHistory.isBrowsingIndex! - 1
        const newReplValue = state[location].replHistory.records[newIndex]
        return {
          ...state,
          [location]: {
            ...state[location],
            replValue: newReplValue,
            replHistory: {
              ...state[location].replHistory,
              isBrowsingIndex: newIndex
            }
          }
        }
      } else {
        // Browsing history, no earlier records to show; return replValue to
        // the last value when user started browsing
        const newIndex = null
        const newReplValue = state[location].replHistory.records[-1]
        const newRecords = state[location].replHistory.records.slice()
        delete newRecords[-1]
        return {
          ...state,
          [location]: {
            ...state[location],
            replValue: newReplValue,
            replHistory: {
              isBrowsingIndex: newIndex,
              records: newRecords
            }
          }
        }
      }
    case BROWSE_REPL_HISTORY_UP:
      const lastRecords = state[location].replHistory.records
      const lastIndex = state[location].replHistory.isBrowsingIndex
      if (
        lastRecords.length === 0 ||
        (lastIndex !== null && lastRecords[lastIndex + 1] === undefined)
      ) {
        // There is no more later history to show
        return state
      } else if (lastIndex === null) {
        // Not yet started browsing, initialise the index & array
        const newIndex = 0
        const newRecords = lastRecords.slice()
        newRecords[-1] = state[location].replValue
        const newReplValue = newRecords[newIndex]
        return {
          ...state,
          [location]: {
            ...state[location],
            replValue: newReplValue,
            replHistory: {
              ...state[location].replHistory,
              isBrowsingIndex: newIndex,
              records: newRecords
            }
          }
        }
      } else {
        // Browsing history, and still have later history to show
        const newIndex = lastIndex + 1
        const newReplValue = lastRecords[newIndex]
        return {
          ...state,
          [location]: {
            ...state[location],
            replValue: newReplValue,
            replHistory: {
              ...state[location].replHistory,
              isBrowsingIndex: newIndex
            }
          }
        }
      }
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
            action.payload.chapter,
            action.payload.externals,
            location
          )
        }
      }
    /**
     * This action is only meant for Playground usage, where
     * the external library is displayed.
     */
    case CHANGE_PLAYGROUND_EXTERNAL:
      return {
        ...state,
        playgroundExternal: action.payload.newExternal
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
      const newReplHistoryRecords = [action.payload.value].concat(
        state[location].replHistory.records
      )
      if (newReplHistoryRecords.length > 50) {
        newReplHistoryRecords.pop()
      }
      return {
        ...state,
        [location]: {
          ...state[location],
          output: newOutput,
          replHistory: {
            ...state[location].replHistory,
            records: newReplHistoryRecords
          }
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
          output: newOutput
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
          output: newOutput
        }
      }
    /**
     * Called to signal the end of an interruption,
     * i.e called after the interpreter is told to stop interruption,
     * to cause UI changes.
     */
    case END_INTERRUPT_EXECUTION:
      /**
       * Set the isRunning property of the
       * context to false, to ensure a re-render.
       * Also in case the async js-slang interrupt()
       * function does not finish interrupting before
       * this action is called.
       */
      return {
        ...state,
        [location]: {
          ...state[location],
          context: {
            ...state[location].context,
            isRunning: false
          }
        }
      }
    /**
     * Resets the assessment workspace (under state.workspaces.assessment).
     */
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
