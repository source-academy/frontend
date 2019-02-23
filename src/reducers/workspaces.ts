import { Reducer } from 'redux'

import {
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_ACTIVE_TAB,
  CHANGE_EDITOR_WIDTH,
  CHANGE_PLAYGROUND_EXTERNAL,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  END_CLEAR_CONTEXT,
  END_INTERRUPT_EXECUTION,
  EVAL_EDITOR,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_REPL,
  HANDLE_CONSOLE_LOG,
  IAction,
  LOG_OUT,
  RESET_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE
} from '../actions/actionTypes'
import { WorkspaceLocation } from '../actions/workspaces'
import { createContext } from '../utils/slangHelper'
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  InterpreterOutput,
  IWorkspaceManagerState,
  maxBrowseIndex
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
      if (state[location].replHistory.browseIndex === null) {
        // Not yet started browsing history, nothing to do
        return state
      } else if (state[location].replHistory.browseIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state[location].replHistory.browseIndex! - 1
        const newReplValue = state[location].replHistory.records[newIndex]
        return {
          ...state,
          [location]: {
            ...state[location],
            replValue: newReplValue,
            replHistory: {
              ...state[location].replHistory,
              browseIndex: newIndex
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
              browseIndex: newIndex,
              records: newRecords
            }
          }
        }
      }
    case BROWSE_REPL_HISTORY_UP:
      const lastRecords = state[location].replHistory.records
      const lastIndex = state[location].replHistory.browseIndex
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
              browseIndex: newIndex,
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
              browseIndex: newIndex
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
    case END_CLEAR_CONTEXT:
      return {
        ...state,
        [location]: {
          ...state[location],
          context: createContext<WorkspaceLocation>(
            action.payload.library.chapter,
            action.payload.library.external.symbols,
            location
          ),
          globals: action.payload.library.globals
        }
      }
    case SEND_REPL_INPUT_TO_OUTPUT:
      // CodeOutput properties exist in parallel with workspaceLocation
      newOutput = state[location].output.concat(action.payload as CodeOutput)
      let newReplHistoryRecords: string[]
      if (action.payload.value !== '') {
        newReplHistoryRecords = [action.payload.value].concat(state[location].replHistory.records)
      } else {
        newReplHistoryRecords = state[location].replHistory.records
      }
      if (newReplHistoryRecords.length > maxBrowseIndex) {
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
    /**
     * This action is only meant for Playground usage, where
     * the external library is displayed.
     */
    case CHANGE_PLAYGROUND_EXTERNAL:
      return {
        ...state,
        playground: {
          ...state.playground,
          playgroundExternal: action.payload.newExternal
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
    case LOG_OUT:
      // Preserve the playground workspace even after log out
      const playgroundWorkspace = state.playground
      return {
        ...defaultWorkspaceManager,
        playground: playgroundWorkspace
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
          isRunning: false
        }
      }
    /**
     * Resets the workspace to default settings,
     * including the js-slang Context. Apply
     * any specified settings (workspaceOptions)
     */
    case RESET_WORKSPACE:
      return {
        ...state,
        [location]: {
          ...state[location],
          ...createDefaultWorkspace(location),
          ...action.payload.workspaceOptions
        }
      }
    case UPDATE_CURRENT_ASSESSMENT_ID:
      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentAssessment: action.payload.assessmentId,
          currentQuestion: action.payload.questionId
        }
      }
    case UPDATE_CURRENT_SUBMISSION_ID:
      return {
        ...state,
        grading: {
          ...state.grading,
          currentSubmission: action.payload.submissionId,
          currentQuestion: action.payload.questionId
        }
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
    case UPDATE_HAS_UNSAVED_CHANGES:
      return {
        ...state,
        [location]: {
          ...state[location],
          hasUnsavedChanges: action.payload.hasUnsavedChanges
        }
      }
    default:
      return state
  }
}
