import { createReducer } from '@reduxjs/toolkit';
import { stringify } from 'js-slang/dist/utils/stringify';
import { Reducer } from 'redux';

import { SourcecastReducer } from '../../features/sourceRecorder/sourcecast/SourcecastReducer';
import { SET_IS_EDITOR_READONLY } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SourcereelReducer } from '../../features/sourceRecorder/sourcereel/SourcereelReducer';
import { logOut } from '../application/actions/CommonsActions';
import {
  evalInterpreterSuccess,
  handleConsoleLog
} from '../application/actions/InterpreterActions';
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  ErrorOutput,
  InterpreterOutput,
  NotificationOutput,
  ResultOutput
} from '../application/ApplicationTypes';
import {
  DEBUG_RESET,
  DEBUG_RESUME,
  END_DEBUG_PAUSE,
  END_INTERRUPT_EXECUTION,
  EVAL_INTERPRETER_ERROR,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS,
  UPDATE_EDITOR_HIGHLIGHTED_LINES,
  UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL
} from '../application/types/InterpreterTypes';
import { Testcase } from '../assessment/AssessmentTypes';
import {
  SET_EDITOR_SESSION_ID,
  SET_SESSION_DETAILS,
  SET_SHAREDB_CONNECTED
} from '../collabEditing/CollabEditingTypes';
import { NOTIFY_PROGRAM_EVALUATED } from '../sideContent/SideContentTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { createContext } from '../utils/JsSlangHelper';
import {
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  changeExternalLibrary,
  changeStepLimit,
  clearReplInput,
  clearReplOutput,
  clearReplOutputLast,
  disableTokenCounter,
  enableTokenCounter,
  endClearContext,
  evalEditor,
  evalRepl,
  sendReplInputToOutput,
  setTokenCount
} from './WorkspaceActions';
import {
  ADD_EDITOR_TAB,
  EditorTabState,
  MOVE_CURSOR,
  REMOVE_EDITOR_TAB,
  REMOVE_EDITOR_TAB_FOR_FILE,
  REMOVE_EDITOR_TABS_FOR_DIRECTORY,
  RENAME_EDITOR_TAB_FOR_FILE,
  RENAME_EDITOR_TABS_FOR_DIRECTORY,
  RESET_TESTCASE,
  RESET_WORKSPACE,
  SET_FOLDER_MODE,
  SHIFT_EDITOR_TAB,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_UPDATE_CSE,
  TOGGLE_USING_CSE,
  TOGGLE_USING_SUBST,
  UPDATE_ACTIVE_EDITOR_TAB,
  UPDATE_ACTIVE_EDITOR_TAB_INDEX,
  UPDATE_BREAKPOINTSTEPS,
  UPDATE_CHANGEPOINTSTEPS,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_CURRENTSTEP,
  UPDATE_EDITOR_BREAKPOINTS,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_LAST_DEBUGGER_RESULT,
  UPDATE_LAST_NON_DET_RESULT,
  UPDATE_REPL_VALUE,
  UPDATE_STEPSTOTAL,
  UPDATE_SUBLANGUAGE,
  UPDATE_SUBMISSIONS_TABLE_FILTERS,
  UPDATE_WORKSPACE,
  WorkspaceLocation,
  WorkspaceManagerState
} from './WorkspaceTypes';

const getWorkspaceLocation = (action: any): WorkspaceLocation => {
  return action.payload ? action.payload.workspaceLocation : 'assessment';
};

/**
 * Takes in a IWorkspaceManagerState and maps it to a new state. The
 * pre-conditions are that
 *   - There exists an IWorkspaceState in the IWorkspaceManagerState of the key
 *     `location`.
 *   - `location` is defined (and exists) as a property 'workspaceLocation' in
 *     the action's payload.
 */
export const WorkspaceReducer: Reducer<WorkspaceManagerState, SourceActionType> = (
  state = defaultWorkspaceManager,
  action
) => {
  const workspaceLocation = getWorkspaceLocation(action);
  switch (workspaceLocation) {
    case 'sourcecast':
      const sourcecastState = SourcecastReducer(state.sourcecast, action);
      if (sourcecastState === state.sourcecast) {
        break;
      }
      return {
        ...state,
        sourcecast: sourcecastState
      };
    case 'sourcereel':
      const sourcereelState = SourcereelReducer(state.sourcereel, action);
      if (sourcereelState === state.sourcereel) {
        break;
      }
      return {
        ...state,
        sourcereel: sourcereelState
      };
    default:
      break;
  }

  state = oldWorkspaceReducer(state, action);
  state = newWorkspaceReducer(state, action);
  return state;
};

const newWorkspaceReducer = createReducer(defaultWorkspaceManager, builder => {
  builder
    .addCase(setTokenCount, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].tokenCount = action.payload.tokenCount;
    })
    .addCase(browseReplHistoryDown, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      if (state[workspaceLocation].replHistory.browseIndex === null) {
        // Not yet started browsing history, nothing to do
        return;
      }
      if (state[workspaceLocation].replHistory.browseIndex !== 0) {
        // Browsing history, and still have earlier records to show
        const newIndex = state[workspaceLocation].replHistory.browseIndex! - 1;
        const newReplValue = state[workspaceLocation].replHistory.records[newIndex];

        state[workspaceLocation].replValue = newReplValue;
        state[workspaceLocation].replHistory.browseIndex = newIndex;
        return;
      }
      // Browsing history, no earlier records to show; return replValue to
      // the last value when user started browsing
      const newIndex = null;
      const newReplValue = state[workspaceLocation].replHistory.originalValue;
      const newRecords = state[workspaceLocation].replHistory.records.slice();

      state[workspaceLocation].replValue = newReplValue;
      state[workspaceLocation].replHistory = {
        browseIndex: newIndex,
        records: newRecords,
        originalValue: ''
      };
    })
    .addCase(browseReplHistoryUp, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const lastRecords = state[workspaceLocation].replHistory.records;
      const lastIndex = state[workspaceLocation].replHistory.browseIndex;
      if (
        lastRecords.length === 0 ||
        (lastIndex !== null && lastRecords[lastIndex + 1] === undefined)
      ) {
        // There is no more later history to show
        return;
      }
      if (lastIndex === null) {
        // Not yet started browsing, initialise the index & array
        const newIndex = 0;
        const newRecords = lastRecords.slice();
        const originalValue = state[workspaceLocation].replValue;
        const newReplValue = newRecords[newIndex];

        state[workspaceLocation].replValue = newReplValue;
        state[workspaceLocation].replHistory = {
          browseIndex: newIndex,
          records: newRecords,
          originalValue
        };
        return;
      }
      // Browsing history, and still have later history to show
      const newIndex = lastIndex + 1;
      const newReplValue = lastRecords[newIndex];
      state[workspaceLocation].replValue = newReplValue;
      state[workspaceLocation].replHistory.browseIndex = newIndex;
    })
    .addCase(changeExecTime, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].execTime = action.payload.execTime;
    })
    .addCase(changeStepLimit, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].stepLimit = action.payload.stepLimit;
    })
    .addCase(clearReplInput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].replValue = '';
    })
    .addCase(clearReplOutputLast, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].output.pop();
    })
    .addCase(clearReplOutput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].output = [];
    })
    .addCase(endClearContext, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          context: createContext<WorkspaceLocation>(
            action.payload.library.chapter,
            action.payload.library.external.symbols,
            workspaceLocation,
            action.payload.library.variant
          ),
          globals: action.payload.library.globals,
          externalLibrary: action.payload.library.external.name
        }
      };
    })
    .addCase(sendReplInputToOutput, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // CodeOutput properties exist in parallel with workspaceLocation
      const newOutput: InterpreterOutput[] = state[workspaceLocation].output.concat(
        action.payload as CodeOutput
      );

      let newReplHistoryRecords: string[];
      if (action.payload.value !== '') {
        newReplHistoryRecords = [action.payload.value].concat(
          state[workspaceLocation].replHistory.records
        );
      } else {
        newReplHistoryRecords = state[workspaceLocation].replHistory.records;
      }
      if (newReplHistoryRecords.length > Constants.maxBrowseIndex) {
        newReplHistoryRecords.pop();
      }

      state[workspaceLocation].output = newOutput;
      state[workspaceLocation].replHistory.records = newReplHistoryRecords;
    })
    .addCase(changeExternalLibrary, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].externalLibrary = action.payload.newExternal;
    })
    .addCase(handleConsoleLog, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      /* Possible cases:
       * (1) state[workspaceLocation].output === [], i.e. state[workspaceLocation].output[-1] === undefined
       * (2) state[workspaceLocation].output[-1] is not RunningOutput
       * (3) state[workspaceLocation].output[-1] is RunningOutput */
      const lastOutput: InterpreterOutput =
        state[workspaceLocation].output[state[workspaceLocation].output.length - 1];
      let newOutput: InterpreterOutput[];

      if (lastOutput === undefined || lastOutput.type !== 'running') {
        // New block of output.
        newOutput = state[workspaceLocation].output.concat({
          type: 'running',
          consoleLogs: [...action.payload.logString]
        });
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload.logString)
        };
        newOutput = state[workspaceLocation].output.slice(0, -1);
        newOutput.push(updatedLastOutput);
      }

      state[workspaceLocation].output = newOutput;
    })
    .addCase(logOut, (state, action) => {
      // Preserve the playground workspace even after log out
      const playgroundWorkspace = state.playground;
      return {
        ...defaultWorkspaceManager,
        playground: playgroundWorkspace
      };
    })
    .addCase(enableTokenCounter, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].hasTokenCounter = true;
    })
    .addCase(disableTokenCounter, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].hasTokenCounter = false;
    })
    .addCase(evalEditor, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(evalRepl, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
    })
    .addCase(evalInterpreterSuccess, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const execType = state[workspaceLocation].context.executionMethod;
      const tokens = state[workspaceLocation].tokenCount;
      const newOutputEntry: Partial<ResultOutput> = {
        type: action.payload.type as 'result' | undefined,
        value: execType === 'interpreter' ? action.payload.value : stringify(action.payload.value)
      };

      const lastOutput: InterpreterOutput = state[workspaceLocation].output.slice(-1)[0];
      let newOutput: InterpreterOutput[];

      if (lastOutput !== undefined && lastOutput.type === 'running') {
        const newOutputEntryWithLogs = {
          consoleLogs: lastOutput.consoleLogs,
          ...newOutputEntry
        } as ResultOutput;
        const notificationOutputs: NotificationOutput[] = [];
        if (state[workspaceLocation].hasTokenCounter) {
          notificationOutputs.push({
            consoleLog: `This program has ${tokens} tokens.`,
            type: 'notification'
          });
        }
        const customNotification = state[workspaceLocation].customNotification;
        if (customNotification !== '') {
          notificationOutputs.push({
            consoleLog: customNotification,
            type: 'notification'
          });
        }
        newOutput = state[workspaceLocation].output
          .slice(0, -1)
          .concat([...notificationOutputs, newOutputEntryWithLogs]);
      } else {
        newOutput = state[workspaceLocation].output.concat({
          consoleLogs: [],
          ...newOutputEntry
        } as ResultOutput);
      }

      state[workspaceLocation].output = newOutput;
      state[workspaceLocation].isRunning = false;
    });
});

const oldWorkspaceReducer: Reducer<WorkspaceManagerState, SourceActionType> = (
  state = defaultWorkspaceManager,
  action
) => {
  const workspaceLocation = getWorkspaceLocation(action);
  let newOutput: InterpreterOutput[];
  let lastOutput: InterpreterOutput;

  switch (action.type) {
    case EVAL_TESTCASE_SUCCESS:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTestcases: state[workspaceLocation].editorTestcases.map(
            (testcase: Testcase, i: any) => {
              if (i === action.payload.index) {
                return {
                  ...testcase,
                  result: action.payload.value,
                  errors: undefined
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
            (testcase: Testcase, i: number) => {
              if (i === action.payload.index) {
                return {
                  ...testcase,
                  result: undefined,
                  errors: action.payload.value
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
          type: action.payload.type,
          errors: action.payload.errors,
          consoleLogs: lastOutput.consoleLogs
        } as ErrorOutput);
      } else {
        newOutput = state[workspaceLocation].output.concat({
          type: action.payload.type,
          errors: action.payload.errors,
          consoleLogs: []
        } as ErrorOutput);
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
    case RESET_TESTCASE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTestcases: state[workspaceLocation].editorTestcases.map(
            (testcase: Testcase, i: any) => {
              if (i === action.payload.index) {
                return {
                  ...testcase,
                  result: undefined,
                  errors: undefined
                };
              } else {
                return testcase;
              }
            }
          )
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
    case SET_SESSION_DETAILS:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sessionDetails: action.payload.sessionDetails
        }
      };
    case SET_IS_EDITOR_READONLY:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isEditorReadonly: action.payload.isEditorReadonly
        }
      };
    case SET_SHAREDB_CONNECTED:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          sharedbConnected: action.payload.connected
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
    case TOGGLE_USING_SUBST: {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            usingSubst: action.payload.usingSubst
          }
        };
      } else {
        return state;
      }
    }
    case TOGGLE_USING_CSE: {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            usingCse: action.payload.usingCse
          }
        };
      } else {
        return state;
      }
    }
    case TOGGLE_UPDATE_CSE: {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            updateCse: action.payload.updateCse
          }
        };
      } else {
        return state;
      }
    }
    case UPDATE_SUBMISSIONS_TABLE_FILTERS:
      return {
        ...state,
        grading: {
          ...state.grading,
          submissionsTableFilters: action.payload.filters
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
    case SET_FOLDER_MODE:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          isFolderModeEnabled: action.payload.isFolderModeEnabled
        }
      };
    case UPDATE_ACTIVE_EDITOR_TAB_INDEX: {
      const activeEditorTabIndex = action.payload.activeEditorTabIndex;
      if (activeEditorTabIndex !== null) {
        if (activeEditorTabIndex < 0) {
          throw new Error('Active editor tab index must be non-negative!');
        }
        if (activeEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
          throw new Error('Active editor tab index must have a corresponding editor tab!');
        }
      }

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: activeEditorTabIndex
        }
      };
    }
    case UPDATE_ACTIVE_EDITOR_TAB: {
      const { activeEditorTabOptions } = action.payload;
      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      // Do not modify the workspace state if there is no active editor tab.
      if (activeEditorTabIndex === null) {
        return state;
      }

      const updatedEditorTabs = [...state[workspaceLocation].editorTabs];
      updatedEditorTabs[activeEditorTabIndex] = {
        ...updatedEditorTabs[activeEditorTabIndex],
        ...activeEditorTabOptions
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: updatedEditorTabs
        }
      };
    }
    case UPDATE_EDITOR_VALUE: {
      const { editorTabIndex, newEditorValue } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const newEditorTabs = [...state[workspaceLocation].editorTabs];
      newEditorTabs[editorTabIndex] = {
        ...newEditorTabs[editorTabIndex],
        value: newEditorValue
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case UPDATE_EDITOR_BREAKPOINTS: {
      const { editorTabIndex, newBreakpoints } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const newEditorTabs = [...state[workspaceLocation].editorTabs];
      newEditorTabs[editorTabIndex] = {
        ...newEditorTabs[editorTabIndex],
        breakpoints: newBreakpoints
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case UPDATE_EDITOR_HIGHLIGHTED_LINES: {
      const { editorTabIndex, newHighlightedLines } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const newEditorTabs = [...state[workspaceLocation].editorTabs];
      newEditorTabs[editorTabIndex] = {
        ...newEditorTabs[editorTabIndex],
        highlightedLines: newHighlightedLines
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case UPDATE_EDITOR_HIGHLIGHTED_LINES_CONTROL: {
      const { editorTabIndex, newHighlightedLines } = action.payload;

      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const newEditorTabs = [...state[workspaceLocation].editorTabs];
      newEditorTabs[editorTabIndex] = {
        ...newEditorTabs[editorTabIndex],
        highlightedLines: newHighlightedLines
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case MOVE_CURSOR: {
      const { editorTabIndex, newCursorPosition } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      const newEditorTabs = [...state[workspaceLocation].editorTabs];
      newEditorTabs[editorTabIndex] = {
        ...newEditorTabs[editorTabIndex],
        newCursorPosition
      };

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case ADD_EDITOR_TAB: {
      const { filePath, editorValue } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const openedEditorTabIndex = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === filePath
      );
      const fileIsAlreadyOpen = openedEditorTabIndex !== -1;
      if (fileIsAlreadyOpen) {
        return {
          ...state,
          [workspaceLocation]: {
            ...state[workspaceLocation],
            activeEditorTabIndex: openedEditorTabIndex
          }
        };
      }

      const newEditorTab: EditorTabState = {
        filePath,
        value: editorValue,
        highlightedLines: [],
        breakpoints: []
      };
      const newEditorTabs: EditorTabState[] = [
        ...state[workspaceLocation].editorTabs,
        newEditorTab
      ];
      // Set the newly added editor tab as the active tab.
      const newActiveEditorTabIndex = newEditorTabs.length - 1;

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: newActiveEditorTabIndex,
          editorTabs: newEditorTabs
        }
      };
    }
    case SHIFT_EDITOR_TAB: {
      const { previousEditorTabIndex, newEditorTabIndex } = action.payload;
      if (previousEditorTabIndex < 0) {
        throw new Error('Previous editor tab index must be non-negative!');
      }
      if (previousEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Previous editor tab index must have a corresponding editor tab!');
      }
      if (newEditorTabIndex < 0) {
        throw new Error('New editor tab index must be non-negative!');
      }
      if (newEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('New editor tab index must have a corresponding editor tab!');
      }

      const newActiveEditorTabIndex =
        state[workspaceLocation].activeEditorTabIndex === previousEditorTabIndex
          ? newEditorTabIndex
          : state[workspaceLocation].activeEditorTabIndex;
      const editorTabs = state[workspaceLocation].editorTabs;
      const shiftedEditorTab = editorTabs[previousEditorTabIndex];
      const filteredEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== previousEditorTabIndex
      );
      const newEditorTabs = [
        ...filteredEditorTabs.slice(0, newEditorTabIndex),
        shiftedEditorTab,
        ...filteredEditorTabs.slice(newEditorTabIndex)
      ];

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: newActiveEditorTabIndex,
          editorTabs: newEditorTabs
        }
      };
    }
    case REMOVE_EDITOR_TAB: {
      const editorTabIndex = action.payload.editorTabIndex;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }
      const newEditorTabs = state[workspaceLocation].editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== editorTabIndex
      );

      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      const newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndex,
        newEditorTabs.length
      );

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: newActiveEditorTabIndex,
          editorTabs: newEditorTabs
        }
      };
    }
    case REMOVE_EDITOR_TAB_FOR_FILE: {
      const removedFilePath = action.payload.removedFilePath;

      const editorTabs = state[workspaceLocation].editorTabs;
      const editorTabIndexToRemove = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === removedFilePath
      );
      if (editorTabIndexToRemove === -1) {
        return state;
      }
      const newEditorTabs = editorTabs.filter(
        (editorTab: EditorTabState, index: number) => index !== editorTabIndexToRemove
      );

      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      const newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
        activeEditorTabIndex,
        editorTabIndexToRemove,
        newEditorTabs.length
      );

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: newActiveEditorTabIndex,
          editorTabs: newEditorTabs
        }
      };
    }
    case REMOVE_EDITOR_TABS_FOR_DIRECTORY: {
      const removedDirectoryPath = action.payload.removedDirectoryPath;

      const editorTabs = state[workspaceLocation].editorTabs;
      const editorTabIndicesToRemove = editorTabs
        .map((editorTab: EditorTabState, index: number) => {
          if (editorTab.filePath?.startsWith(removedDirectoryPath)) {
            return index;
          }
          return null;
        })
        .filter((index: number | null): index is number => index !== null);
      if (editorTabIndicesToRemove.length === 0) {
        return state;
      }

      let newActiveEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      const newEditorTabs = [...editorTabs];
      for (let i = editorTabIndicesToRemove.length - 1; i >= 0; i--) {
        const editorTabIndexToRemove = editorTabIndicesToRemove[i];
        newEditorTabs.splice(editorTabIndexToRemove, 1);
        newActiveEditorTabIndex = getNextActiveEditorTabIndexAfterTabRemoval(
          newActiveEditorTabIndex,
          editorTabIndexToRemove,
          newEditorTabs.length
        );
      }

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          activeEditorTabIndex: newActiveEditorTabIndex,
          editorTabs: newEditorTabs
        }
      };
    }
    case RENAME_EDITOR_TAB_FOR_FILE: {
      const { oldFilePath, newFilePath } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const newEditorTabs = editorTabs.map((editorTab: EditorTabState) =>
        editorTab.filePath === oldFilePath
          ? {
              ...editorTab,
              filePath: newFilePath
            }
          : editorTab
      );

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
    case RENAME_EDITOR_TABS_FOR_DIRECTORY: {
      const { oldDirectoryPath, newDirectoryPath } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const newEditorTabs = editorTabs.map((editorTab: EditorTabState) =>
        editorTab.filePath?.startsWith(oldDirectoryPath)
          ? {
              ...editorTab,
              filePath: editorTab.filePath?.replace(oldDirectoryPath, newDirectoryPath)
            }
          : editorTab
      );

      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          editorTabs: newEditorTabs
        }
      };
    }
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
    case UPDATE_SUBLANGUAGE:
      return {
        ...state,
        playground: {
          ...state.playground,
          context: {
            ...state.playground.context,
            chapter: action.payload.sublang.chapter,
            variant: action.payload.sublang.variant
          }
        }
      };
    case UPDATE_CURRENTSTEP:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          currentStep: action.payload.steps
        }
      };
    case UPDATE_STEPSTOTAL:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          stepsTotal: action.payload.steps
        }
      };
    case UPDATE_BREAKPOINTSTEPS:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          breakpointSteps: action.payload.breakpointSteps
        }
      };
    case UPDATE_CHANGEPOINTSTEPS:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          changepointSteps: action.payload.changepointSteps
        }
      };
    case UPDATE_LAST_DEBUGGER_RESULT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          lastDebuggerResult: action.payload.lastDebuggerResult
        }
      };

    case UPDATE_LAST_NON_DET_RESULT:
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          lastNonDetResult: action.payload.lastNonDetResult
        }
      };
    case NOTIFY_PROGRAM_EVALUATED: {
      const debuggerContext = {
        ...state[workspaceLocation].debuggerContext,
        result: action.payload.result,
        lastDebuggerResult: action.payload.lastDebuggerResult,
        code: action.payload.code,
        context: action.payload.context,
        workspaceLocation: action.payload.workspaceLocation
      };
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          debuggerContext
        }
      };
    }
    default:
      return state;
  }
};

const getNextActiveEditorTabIndexAfterTabRemoval = (
  activeEditorTabIndex: number | null,
  removedEditorTabIndex: number,
  newEditorTabsLength: number
) => {
  return activeEditorTabIndex !== removedEditorTabIndex
    ? // If the active editor tab is not the one that is removed,
      // the active editor tab remains the same if its index is
      // less than the removed editor tab index or null.
      activeEditorTabIndex === null || activeEditorTabIndex < removedEditorTabIndex
      ? activeEditorTabIndex
      : // Otherwise, the active editor tab index needs to have 1
        // subtracted because every tab to the right of the editor
        // tab being removed has their index decremented by 1.
        activeEditorTabIndex - 1
    : newEditorTabsLength === 0
    ? // If there are no editor tabs after removal, there cannot
      // be an active editor tab.
      null
    : removedEditorTabIndex === 0
    ? // If the removed editor tab is the leftmost tab, the active
      // editor tab will be the new leftmost tab.
      0
    : // Otherwise, the active editor tab will be the tab to the
      // left of the removed tab.
      removedEditorTabIndex - 1;
};
