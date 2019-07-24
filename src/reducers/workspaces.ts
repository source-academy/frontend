import { Reducer } from 'redux';
import { ITestcase } from '../components/assessment/assessmentShape';

import {
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_ACTIVE_TAB,
  CHANGE_EDITOR_HEIGHT,
  CHANGE_EDITOR_WIDTH,
  CHANGE_PLAYGROUND_EXTERNAL,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  DEBUG_RESET,
  DEBUG_RESUME,
  END_CLEAR_CONTEXT,
  END_DEBUG_PAUSE,
  END_INTERRUPT_EXECUTION,
  EVAL_EDITOR,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_REPL,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS,
  FINISH_INVITE,
  HANDLE_CONSOLE_LOG,
  HIGHLIGHT_LINE,
  IAction,
  INIT_INVITE,
  LOG_OUT,
  RESET_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  SET_EDITOR_SESSION_ID,
  SET_WEBSOCKET_STATUS,
  TOGGLE_EDITOR_AUTORUN,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE,
  UPDATE_WORKSPACE
} from '../actions/actionTypes';
import { WorkspaceLocation } from '../actions/workspaces';
import { createContext } from '../utils/slangHelper';
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  InterpreterOutput,
  IWorkspaceManagerState,
  maxBrowseIndex
} from './states';

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
  const workspaceLocation: WorkspaceLocation =
    action.payload !== undefined ? action.payload.workspaceLocation : undefined;
  let newOutput: InterpreterOutput[];
  let lastOutput: InterpreterOutput;

  switch (action.type) {
    case BROWSE_REPL_HISTORY_DOWN:
      if (state[workspaceLocation].replHistory.browseIndex === null) {
        // Not yet started browsing history, nothing to do
        return state;
      } else if (state[workspaceLocation].replHistory.browseIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state[workspaceLocation].replHistory.browseIndex! - 1;
        const newReplValue = state[workspaceLocation].replHistory.records[newIndex];
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            replValue: newReplValue,
            replHistory: {
              ...state[workspaceLocation].replHistory,
              browseIndex: newIndex
            }
          }
        };
      } else {
        // Browsing history, no earlier records to show; return replValue to
        // the last value when user started browsing
        const newIndex = null;
        const newReplValue = state[workspaceLocation].replHistory.originalValue;
        const newRecords = state[workspaceLocation].replHistory.records.slice();
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            replValue: newReplValue,
            replHistory: {
              browseIndex: newIndex,
              records: newRecords,
              originalValue: ''
            }
          }
        };
      }
    case BROWSE_REPL_HISTORY_UP:
      const lastRecords = state[workspaceLocation].replHistory.records;
      const lastIndex = state[workspaceLocation].replHistory.browseIndex;
      if (
        lastRecords.length === 0 ||
        (lastIndex !== null && lastRecords[lastIndex + 1] === undefined)
      ) {
        // There is no more later history to show
        return state;
      } else if (lastIndex === null) {
        // Not yet started browsing, initialise the index & array
        const newIndex = 0;
        const newRecords = lastRecords.slice();
        const originalValue = state[workspaceLocation].replValue;
        const newReplValue = newRecords[newIndex];
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            replValue: newReplValue,
            replHistory: {
              ...state[workspaceLocation].replHistory,
              browseIndex: newIndex,
              records: newRecords,
              originalValue
            }
          }
        };
      } else {
        // Browsing history, and still have later history to show
        const newIndex = lastIndex + 1;
        const newReplValue = lastRecords[newIndex];
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            replValue: newReplValue,
            replHistory: {
              ...state[workspaceLocation].replHistory,
              browseIndex: newIndex
            }
          }
        };
      }
    case CHANGE_ACTIVE_TAB:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sideContentActiveTab: action.payload.activeTab
        }
      };
    case CHANGE_EDITOR_HEIGHT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorHeight: action.payload.height
        }
      };
    case CHANGE_EDITOR_WIDTH:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorWidth:
            (
              parseFloat(state[workspaceLocation].editorWidth.slice(0, -1)) +
              action.payload.widthChange
            ).toString() + '%'
        }
      };
    case CHANGE_SIDE_CONTENT_HEIGHT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sideContentHeight: action.payload.height
        }
      };
    case CLEAR_REPL_INPUT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          replValue: ''
        }
      };
    case CLEAR_REPL_OUTPUT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          output: []
        }
      };
    case END_CLEAR_CONTEXT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          context: createContext<WorkspaceLocation>(
            action.payload.library.chapter,
            action.payload.library.external.symbols,
            workspaceLocation
          ),
          globals: action.payload.library.globals
        }
      };
    case SEND_REPL_INPUT_TO_OUTPUT:
      // CodeOutput properties exist in parallel with workspaceLocation
      newOutput = state[workspaceLocation].output.concat(action.payload as CodeOutput);
      let newReplHistoryRecords: string[];
      if (action.payload.value !== '') {
        newReplHistoryRecords = [action.payload.value].concat(
          state[workspaceLocation].replHistory.records
        );
      } else {
        newReplHistoryRecords = state[workspaceLocation].replHistory.records;
      }
      if (newReplHistoryRecords.length > maxBrowseIndex) {
        newReplHistoryRecords.pop();
      }
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          output: newOutput,
          replHistory: {
            ...state[workspaceLocation].replHistory,
            records: newReplHistoryRecords
          }
        }
      };
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
      };
    case HANDLE_CONSOLE_LOG:
      /* Possible cases:
       * (1) state[workspaceLocation].output === [], i.e. state[workspaceLocation].output[-1] === undefined
       * (2) state[workspaceLocation].output[-1] is not RunningOutput
       * (3) state[workspaceLocation].output[-1] is RunningOutput */
      lastOutput = state[workspaceLocation].output.slice(-1)[0];
      if (lastOutput === undefined || lastOutput.type !== 'running') {
        newOutput = state[workspaceLocation].output.concat({
          type: 'running',
          consoleLogs: [action.payload.logString]
        });
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload.logString)
        };
        newOutput = state[workspaceLocation].output.slice(0, -1).concat(updatedLastOutput);
      }
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          output: newOutput
        }
      };
    case LOG_OUT:
      // Preserve the playground workspace even after log out
      const playgroundWorkspace = state.playground;
      return {
        ...defaultWorkspaceManager,
        playground: playgroundWorkspace
      };
    case EVAL_EDITOR:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: true,
          isDebugging: false
        }
      };
    case EVAL_REPL:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: true
        }
      };
    case EVAL_INTERPRETER_SUCCESS:
      lastOutput = state[workspaceLocation].output.slice(-1)[0];
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state[workspaceLocation].output.slice(0, -1).concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: lastOutput.consoleLogs
        });
      } else {
        newOutput = state[workspaceLocation].output.concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: []
        });
      }
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          output: newOutput,
          isRunning: false,
          breakpoints: [],
          highlightedLines: []
        }
      };
    case EVAL_TESTCASE_SUCCESS:
      lastOutput = state[workspaceLocation].output.slice(-1)[0];
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state[workspaceLocation].output.slice(0, -1).concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: lastOutput.consoleLogs
        });
      } else {
        newOutput = state[workspaceLocation].output.concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: []
        });
      }
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTestcases: state[workspaceLocation].editorTestcases.map(
            (testcase: ITestcase, i) => {
              if (i === action.payload.index) {
                return {
                  ...testcase,
                  result: (newOutput[0] as CodeOutput).value
                };
              } else {
                return testcase;
              }
            }
          ),
          isRunning: false
        }
      };
    case EVAL_TESTCASE_FAILURE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTestcases: state[workspaceLocation].editorTestcases.map(
            (testcase: ITestcase, i: number) => {
              if (i === action.payload.index) {
                return {
                  ...testcase,
                  result: action.payload.value
                };
              }
              return testcase;
            }
          )
        }
      };
    case EVAL_INTERPRETER_ERROR:
      lastOutput = state[workspaceLocation].output.slice(-1)[0];
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state[workspaceLocation].output.slice(0, -1).concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: lastOutput.consoleLogs
        });
      } else {
        newOutput = state[workspaceLocation].output.concat({
          ...action.payload,
          workspaceLocation: undefined,
          consoleLogs: []
        });
      }
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          output: newOutput,
          isRunning: false,
          isDebugging: false
        }
      };
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
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: false,
          isDebugging: false
        }
      };

    case END_DEBUG_PAUSE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: false,
          isDebugging: true
        }
      };

    case DEBUG_RESUME:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: true,
          isDebugging: false
        }
      };

    case DEBUG_RESET:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isRunning: false,
          isDebugging: false
        }
      };
    /**
     * Resets the workspace to default settings,
     * including the js-slang Context. Apply
     * any specified settings (workspaceOptions)
     */
    case RESET_WORKSPACE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          ...createDefaultWorkspace(workspaceLocation),
          ...action.payload.workspaceOptions
        }
      };
    case INIT_INVITE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sharedbAceInitValue: action.payload.editorValue,
          sharedbAceIsInviting: true
        }
      };
    case FINISH_INVITE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sharedbAceIsInviting: false
        }
      };
    /**
     * Updates workspace without changing anything
     * which has not been specified
     */
    case UPDATE_WORKSPACE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          ...action.payload.workspaceOptions
        }
      };
    case SET_EDITOR_SESSION_ID:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorSessionId: action.payload.editorSessionId
        }
      };
    case SET_WEBSOCKET_STATUS:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          websocketStatus: action.payload.websocketStatus
        }
      };
    case TOGGLE_EDITOR_AUTORUN:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isEditorAutorun: !state[workspaceLocation].isEditorAutorun
        }
      };
    case UPDATE_CURRENT_ASSESSMENT_ID:
      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentAssessment: action.payload.assessmentId,
          currentQuestion: action.payload.questionId
        }
      };
    case UPDATE_CURRENT_SUBMISSION_ID:
      return {
        ...state,
        grading: {
          ...state.grading,
          currentSubmission: action.payload.submissionId,
          currentQuestion: action.payload.questionId
        }
      };
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorValue: action.payload.newEditorValue
        }
      };
    case HIGHLIGHT_LINE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          highlightedLines: action.payload.highlightedLines
        }
      };
    case UPDATE_REPL_VALUE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          replValue: action.payload.newReplValue
        }
      };
    case UPDATE_HAS_UNSAVED_CHANGES:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          hasUnsavedChanges: action.payload.hasUnsavedChanges
        }
      };
    default:
      return state;
  }
};
