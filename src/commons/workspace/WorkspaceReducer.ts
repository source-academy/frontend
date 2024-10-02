import { createReducer, Reducer } from '@reduxjs/toolkit';
import { stringify } from 'js-slang/dist/utils/stringify';

import { SourcecastReducer } from '../../features/sourceRecorder/sourcecast/SourcecastReducer';
import { SourcereelReducer } from '../../features/sourceRecorder/sourcereel/SourcereelReducer';
import { logOut } from '../application/actions/CommonsActions';
import InterpreterActions from '../application/actions/InterpreterActions';
import {
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
import { createContext } from '../utils/JsSlangHelper';
import { handleCseAndStepperActions } from './reducers/cseReducer';
import { handleDebuggerActions } from './reducers/debuggerReducer';
import { handleEditorActions } from './reducers/editorReducer';
import { handleReplActions } from './reducers/replReducer';
import WorkspaceActions from './WorkspaceActions';
import { WorkspaceLocation, WorkspaceManagerState } from './WorkspaceTypes';

export const getWorkspaceLocation = (action: any): WorkspaceLocation => {
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
  handleEditorActions(builder);
  handleCseAndStepperActions(builder);
  handleReplActions(builder);
  handleDebuggerActions(builder);
  builder
    .addCase(WorkspaceActions.setTokenCount, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].tokenCount = action.payload.tokenCount;
    })
    .addCase(WorkspaceActions.changeExecTime, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].execTime = action.payload.execTime;
    })
    .addCase(WorkspaceActions.endClearContext, (state, action) => {
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
    .addCase(WorkspaceActions.changeExternalLibrary, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].externalLibrary = action.payload.newExternal;
    })
    .addCase(InterpreterActions.handleConsoleLog, (state, action) => {
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
    .addCase(WorkspaceActions.enableTokenCounter, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].hasTokenCounter = true;
    })
    .addCase(WorkspaceActions.disableTokenCounter, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].hasTokenCounter = false;
    })
    .addCase(WorkspaceActions.evalEditor, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isRunning = true;
      state[workspaceLocation].isDebugging = false;
    })
    .addCase(InterpreterActions.evalInterpreterSuccess, (state, action) => {
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
    .addCase(InterpreterActions.evalTestcaseSuccess, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const testcase = state[workspaceLocation].editorTestcases[action.payload.index];
      testcase.result = action.payload.value;
      testcase.errors = undefined;
      state[workspaceLocation].isRunning = false;
    })
    .addCase(InterpreterActions.evalTestcaseFailure, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      const testcase = state[workspaceLocation].editorTestcases[action.payload.index];
      testcase.result = undefined;
      testcase.errors = action.payload.value;
    })
    .addCase(InterpreterActions.evalInterpreterError, (state, action) => {
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
    .addCase(InterpreterActions.endInterruptExecution, (state, action) => {
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
    .addCase(WorkspaceActions.resetTestcase, (state, action) => {
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
    .addCase(WorkspaceActions.resetWorkspace, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      // For some reason mutating the state directly results in type
      // errors, so we have to do it the old-fashioned way
      return {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          ...createDefaultWorkspace(workspaceLocation),
          ...action.payload.workspaceOptions
        }
      };
    })
    /**
     * Updates workspace without changing anything
     * which has not been specified
     */
    .addCase(WorkspaceActions.updateWorkspace, (state, action) => {
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
    .addCase(WorkspaceActions.increaseRequestCounter, state => {
      state.grading.requestCounter += 1;
    })
    .addCase(WorkspaceActions.decreaseRequestCounter, state => {
      state.grading.requestCounter = Math.max(0, state.grading.requestCounter - 1);
    })
    .addCase(setEditorSessionId, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].editorSessionId = action.payload.editorSessionId;
    })
    .addCase(WorkspaceActions.setGradingHasLoadedBefore, (state, action) => {
      state.grading.hasLoadedBefore = action.payload;
    })
    .addCase(setSessionDetails, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].sessionDetails = action.payload.sessionDetails;
    })
    .addCase(WorkspaceActions.setIsEditorReadonly, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isEditorReadonly = action.payload.isEditorReadonly;
    })
    .addCase(setSharedbConnected, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].sharedbConnected = action.payload.connected;
    })
    .addCase(WorkspaceActions.toggleEditorAutorun, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].isEditorAutorun = !state[workspaceLocation].isEditorAutorun;
    })
    .addCase(WorkspaceActions.updateSubmissionsTableFilters, (state, action) => {
      state.grading.submissionsTableFilters = action.payload.filters;
    })
    .addCase(WorkspaceActions.updateAllColsSortStates, (state, action) => {
      state.grading.allColsSortStates = action.payload.sortStates;
    })
    .addCase(WorkspaceActions.updateCurrentAssessmentId, (state, action) => {
      state.assessment.currentAssessment = action.payload.assessmentId;
      state.assessment.currentQuestion = action.payload.questionId;
    })
    .addCase(WorkspaceActions.updateCurrentSubmissionId, (state, action) => {
      state.grading.currentSubmission = action.payload.submissionId;
      state.grading.currentQuestion = action.payload.questionId;
    })
    .addCase(WorkspaceActions.updateHasUnsavedChanges, (state, action) => {
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
    .addCase(WorkspaceActions.updateSublanguage, (state, action) => {
      // TODO: Mark for removal
      const { chapter, variant } = action.payload.sublang;
      state.playground.context.chapter = chapter;
      state.playground.context.variant = variant;
    })
    // .addCase(notifyProgramEvaluated, (state, action) => {
    //   const workspaceLocation = getWorkspaceLocation(action);
    //   const debuggerContext = state[workspaceLocation].debuggerContext;
    //   debuggerContext.result = action.payload.result;
    //   debuggerContext.lastDebuggerResult = action.payload.lastDebuggerResult;
    //   debuggerContext.code = action.payload.code;
    //   debuggerContext.context = action.payload.context;
    //   debuggerContext.workspaceLocation = action.payload.workspaceLocation;
    // })
    .addCase(WorkspaceActions.toggleUsingUpload, (state, action) => {
      const { workspaceLocation } = action.payload;
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].usingUpload = action.payload.usingUpload;
      }
    })
    .addCase(WorkspaceActions.uploadFiles, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      if (workspaceLocation === 'playground' || workspaceLocation === 'sicp') {
        state[workspaceLocation].files = action.payload.files;
      }
    })
    .addCase(WorkspaceActions.updateLastDebuggerResult, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].lastDebuggerResult = action.payload.lastDebuggerResult;
    })
    .addCase(WorkspaceActions.updateLastNonDetResult, (state, action) => {
      const workspaceLocation = getWorkspaceLocation(action);
      state[workspaceLocation].lastNonDetResult = action.payload.lastNonDetResult;
    });
});

/** Temporarily kept to prevent conflicts */
const oldWorkspaceReducer: Reducer<WorkspaceManagerState, SourceActionType> = (
  state = defaultWorkspaceManager,
  action
) => {
  const workspaceLocation = getWorkspaceLocation(action);

  switch (action.type) {
    case WorkspaceActions.notifyProgramEvaluated.type: {
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
