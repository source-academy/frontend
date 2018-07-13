import { Reducer } from 'redux'

import {
  CHANGE_ACTIVE_TAB,
  CHANGE_CHAPTER,
  CHANGE_EDITOR_WIDTH,
  CHANGE_LIBRARY,
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
  IWorkspaceManagerState,
  sourceLibraries
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
  let chapter: number
  let externals: string[]

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
    /**
     * This action is only meant for Playground usage,
     * as chapter is specified by an individual question for an
     * Assessment.
     */
    case CHANGE_CHAPTER:
      externals = sourceLibraries.get(state.playgroundLibrary) || []
      return {
        ...state,
        [location]: {
          ...state[location],
          context: createContext<WorkspaceLocation>(action.payload.newChapter, externals, location)
        }
      }
    /**
     * This action is only meant for Playground usage,
     * as external library is specified by an individual question for an
     * Assessment.
     */
    case CHANGE_LIBRARY:
      chapter = state[location].context.chapter
      externals = sourceLibraries.get(action.payload.newLibrary) || []
      return {
        ...state,
        [location]: {
          ...state[location],
          context: createContext<WorkspaceLocation>(chapter, externals, location)
        },
        playgroundLibrary: action.payload.newLibrary
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
          ...state[location]
        }
      }
    case EVAL_REPL:
      return {
        ...state,
        [location]: {
          ...state[location]
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
      chapter = action.payload.chapter
      externals = action.payload.externals
      return {
        ...state,
        assessment: createDefaultWorkspace(WorkspaceLocations.assessment, chapter, externals),
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
