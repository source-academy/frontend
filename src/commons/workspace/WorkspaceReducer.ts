import { createReducer } from '@reduxjs/toolkit';
import { stringify } from 'js-slang/dist/utils/stringify';
import { Reducer } from 'redux';

import { SourcecastReducer } from '../../features/sourceRecorder/sourcecast/SourcecastReducer';
import { SourcereelReducer } from '../../features/sourceRecorder/sourcereel/SourcereelReducer';
import { logOut } from '../application/actions/CommonsActions';
import {
  debuggerReset,
  debuggerResume,
  endDebuggerPause,
  endInterruptExecution,
  evalInterpreterError,
  evalInterpreterSuccess,
  evalTestcaseFailure,
  evalTestcaseSuccess,
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
  setEditorSessionId,
  setSessionDetails,
  setSharedbConnected
} from '../collabEditing/CollabEditingActions';
import { SourceActionType } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { createContext } from '../utils/JsSlangHelper';
import {
  addEditorTab,
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
  moveCursor,
  notifyProgramEvaluated,
  removeEditorTab,
  removeEditorTabForFile,
  removeEditorTabsForDirectory,
  renameEditorTabForFile,
  renameEditorTabsForDirectory,
  resetTestcase,
  resetWorkspace,
  sendReplInputToOutput,
  setEditorBreakpoint,
  setEditorHighlightedLines,
  setEditorHighlightedLinesControl,
  setFolderMode,
  setIsEditorReadonly,
  setTokenCount,
  shiftEditorTab,
  toggleEditorAutorun,
  toggleUpdateCse,
  toggleUsingCse,
  toggleUsingSubst,
  updateActiveEditorTab,
  updateActiveEditorTabIndex,
  updateBreakpointSteps,
  updateCurrentAssessmentId,
  updateCurrentStep,
  updateCurrentSubmissionId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateStepsTotal,
  updateSublanguage,
  updateSubmissionsTableFilters,
  updateWorkspace
} from './WorkspaceActions';
import {
  EditorTabState,
  UPDATE_LAST_DEBUGGER_RESULT,
  UPDATE_LAST_NON_DET_RESULT,
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
    })
    .addCase(evalTestcaseSuccess, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const testcase = state[workspaceLocation].editorTestcases[action.payload.index];
      testcase.result = action.payload.value;
      testcase.errors = undefined;
    })
    .addCase(evalTestcaseFailure, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const testcase = state[workspaceLocation].editorTestcases[action.payload.index];
      testcase.result = undefined;
      testcase.errors = action.payload.value;
    })
    .addCase(evalInterpreterError, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);

      const lastOutput: InterpreterOutput = state[workspaceLocation].output.slice(-1)[0];
      let newOutput: InterpreterOutput[];

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

      state[workspaceLocation].output = newOutput;
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = false;
    })
    /**
     * Called to signal the end of an interruption,
     * i.e called after the interpreter is told to stop interruption,
     * to cause UI changes.
     */
    .addCase(endInterruptExecution, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      /**
       * Set the isRunning property of the
       * context to false, to ensure a re-render.
       * Also in case the async js-slang interrupt()
       * function does not finish interrupting before
       * this action is called.
       */
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(endDebuggerPause, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = true;
    })
    .addCase(debuggerResume, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(debuggerReset, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = false;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(resetTestcase, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const testcase = state[workspaceLocation].editorTestcases[action.payload.index];
      testcase.result = undefined;
      testcase.errors = undefined;
    })
    /**
     * Resets the workspace to default settings,
     * including the js-slang Context. Apply
     * any specified settings (workspaceOptions)
     */
    .addCase(resetWorkspace, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      return {
        ...state,
        [workspaceLocation]: {
          // ...state[workspaceLocation],
          ...createDefaultWorkspace(workspaceLocation),
          ...action.payload.workspaceOptions
        }
      };
    })
    /**
     * Updates workspace without changing anything
     * which has not been specified
     */
    .addCase(updateWorkspace, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          ...action.payload.workspaceOptions
        }
      };
    })
    .addCase(setEditorSessionId, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].editorSessionId = action.payload.editorSessionId;
    })
    .addCase(setSessionDetails, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].sessionDetails = action.payload.sessionDetails;
    })
    .addCase(setIsEditorReadonly, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isEditorReadonly = action.payload.isEditorReadonly;
    })
    .addCase(setSharedbConnected, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].sharedbConnected = action.payload.connected;
    })
    .addCase(toggleEditorAutorun, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isEditorAutorun = !state[workspaceLocation].isEditorAutorun;
    })
    .addCase(toggleUsingSubst, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].usingSubst = action.payload.usingSubst;
      }
    })
    .addCase(toggleUsingCse, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].usingCse = action.payload.usingCse;
      }
    })
    .addCase(toggleUpdateCse, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].updateCse = action.payload.updateCse;
      }
    })
    .addCase(updateSubmissionsTableFilters, (state, action) => {
      state.grading.submissionsTableFilters = action.payload.filters;
    })
    .addCase(updateCurrentAssessmentId, (state, action) => {
      state.assessment.currentAssessment = action.payload.assessmentId;
      state.assessment.currentQuestion = action.payload.questionId;
    })
    .addCase(updateCurrentSubmissionId, (state, action) => {
      state.grading.currentSubmission = action.payload.submissionId;
      state.grading.currentQuestion = action.payload.questionId;
    })
    .addCase(setFolderMode, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isFolderModeEnabled = action.payload.isFolderModeEnabled;
    })
    .addCase(updateActiveEditorTabIndex, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const activeEditorTabIndex = action.payload.activeEditorTabIndex;
      if (activeEditorTabIndex !== null) {
        if (activeEditorTabIndex < 0) {
          throw new Error('Active editor tab index must be non-negative!');
        }
        if (activeEditorTabIndex >= state[workspaceLocation].editorTabs.length) {
          throw new Error('Active editor tab index must have a corresponding editor tab!');
        }
      }

      state[workspaceLocation].activeEditorTabIndex = activeEditorTabIndex;
    })
    .addCase(updateActiveEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { activeEditorTabOptions } = action.payload;
      const activeEditorTabIndex = state[workspaceLocation].activeEditorTabIndex;
      // Do not modify the workspace state if there is no active editor tab.
      if (activeEditorTabIndex === null) {
        return;
      }

      const updatedEditorTabs = [...state[workspaceLocation].editorTabs];
      updatedEditorTabs[activeEditorTabIndex] = {
        ...updatedEditorTabs[activeEditorTabIndex],
        ...activeEditorTabOptions
      };

      state[workspaceLocation].editorTabs = updatedEditorTabs;
    })
    .addCase(updateEditorValue, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newEditorValue } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].value = newEditorValue;
    })
    .addCase(setEditorBreakpoint, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newBreakpoints } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].breakpoints = newBreakpoints;
    })
    .addCase(setEditorHighlightedLines, (state, action) => {
      // TODO: This and the subsequent reducer achieves the same thing?
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newHighlightedLines } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].highlightedLines = newHighlightedLines;
    })
    .addCase(setEditorHighlightedLinesControl, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newHighlightedLines } = action.payload;

      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].highlightedLines = newHighlightedLines;
    })
    .addCase(moveCursor, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { editorTabIndex, newCursorPosition } = action.payload;
      if (editorTabIndex < 0) {
        throw new Error('Editor tab index must be non-negative!');
      }
      if (editorTabIndex >= state[workspaceLocation].editorTabs.length) {
        throw new Error('Editor tab index must have a corresponding editor tab!');
      }

      state[workspaceLocation].editorTabs[editorTabIndex].newCursorPosition = newCursorPosition;
    })
    .addCase(addEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { filePath, editorValue } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const openedEditorTabIndex = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === filePath
      );
      const fileIsAlreadyOpen = openedEditorTabIndex !== -1;
      if (fileIsAlreadyOpen) {
        state[workspaceLocation].activeEditorTabIndex = openedEditorTabIndex;
        return;
      }

      const newEditorTab: EditorTabState = {
        filePath,
        value: editorValue,
        highlightedLines: [],
        breakpoints: []
      };
      editorTabs.push(newEditorTab);
      // Set the newly added editor tab as the active tab.
      const newActiveEditorTabIndex = editorTabs.length - 1;
      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
    })
    .addCase(shiftEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
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

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(removeEditorTab, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
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

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(removeEditorTabForFile, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const removedFilePath = action.payload.removedFilePath;

      const editorTabs = state[workspaceLocation].editorTabs;
      const editorTabIndexToRemove = editorTabs.findIndex(
        (editorTab: EditorTabState) => editorTab.filePath === removedFilePath
      );
      if (editorTabIndexToRemove === -1) {
        return;
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

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(removeEditorTabsForDirectory, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
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
        return;
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

      state[workspaceLocation].activeEditorTabIndex = newActiveEditorTabIndex;
      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(renameEditorTabForFile, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const { oldFilePath, newFilePath } = action.payload;

      const editorTabs = state[workspaceLocation].editorTabs;
      const tabToEdit = editorTabs.find(({ filePath }) => filePath === oldFilePath);
      if (tabToEdit) {
        tabToEdit.filePath = newFilePath;
      }
    })
    .addCase(renameEditorTabsForDirectory, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
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

      state[workspaceLocation].editorTabs = newEditorTabs;
    })
    .addCase(updateReplValue, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].replValue = action.payload.newReplValue;
    })
    .addCase(updateHasUnsavedChanges, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          hasUnsavedChanges: action.payload.hasUnsavedChanges
        }
      };
    })
    .addCase(updateSublanguage, (state, action) => {
      // TODO: Mark for removal
      const { chapter, variant } = action.payload.sublang;
      state.playground.context.chapter = chapter;
      state.playground.context.variant = variant;
    })
    .addCase(updateCurrentStep, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          currentStep: action.payload.steps
        }
      };
    })
    .addCase(updateStepsTotal, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          stepsTotal: action.payload.steps
        }
      };
    })
    .addCase(updateBreakpointSteps, (state, action) => {
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      const workspaceLocation = getWorkspaceLocation(action);
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          breakpointSteps: action.payload.breakpointSteps
        }
      };
    })
    .addCase(notifyProgramEvaluated, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);

      const debuggerContext = state[workspaceLocation].debuggerContext;
      debuggerContext.result = action.payload.result;
      debuggerContext.lastDebuggerResult = action.payload.lastDebuggerResult;
      debuggerContext.code = action.payload.code;
      debuggerContext.context = action.payload.context;
      debuggerContext.workspaceLocation = action.payload.workspaceLocation;
    });
});

/** Temporarily kept to prevent conflicts */
const oldWorkspaceReducer: Reducer<WorkspaceManagerState, SourceActionType> = (
  state = defaultWorkspaceManager,
  action
) => {
  const workspaceLocation = getWorkspaceLocation(action);

  switch (action.type) {
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
