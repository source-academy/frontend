import { Chapter, Variant } from 'js-slang/dist/types';
import { cloneDeep } from 'lodash';
import CommonsActions from 'src/commons/application/actions/CommonsActions';
import InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import {
  setEditorSessionId,
  setSharedbConnected
} from 'src/commons/collabEditing/CollabEditingActions';

import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  InterpreterOutput,
  RunningOutput
} from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import { Library, Testcase, TestcaseTypes } from '../../assessment/AssessmentTypes';
import { HighlightedLines, Position } from '../../editor/EditorTypes';
import Constants from '../../utils/Constants';
import { createContext } from '../../utils/JsSlangHelper';
import WorkspaceActions from '../WorkspaceActions';
import { WorkspaceReducer } from '../WorkspaceReducer';
import {
  EditorTabState,
  PlaygroundWorkspaceState,
  WorkspaceLocation,
  WorkspaceManagerState
} from '../WorkspaceTypes';

const playgroundWorkspace: WorkspaceLocation = 'playground';
const sicpWorkspace: WorkspaceLocation = 'sicp';
const locations: ReadonlyArray<WorkspaceLocation> = [
  'assessment',
  'grading',
  'playground',
  'sourcecast',
  'sourcereel',
  'sicp'
] as const;

function generateActions(type: string, payload: any = {}): any[] {
  return locations.map(l => ({ type, payload: { ...payload, workspaceLocation: l } }));
}

// cloneDeep not required for proper redux
// only required because of high performance console mutating instead of cloning the entire consoleLogs buffer just to push 1 item.
// Basically breaks redux guarantees but works perfectly fine in practice.
function generateDefaultWorkspace(payload: any = {}): WorkspaceManagerState {
  return {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      ...cloneDeep(payload)
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      ...cloneDeep(payload)
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      ...cloneDeep(payload)
    },
    sourcecast: {
      ...defaultWorkspaceManager.sourcecast,
      ...cloneDeep(payload)
    },
    sourcereel: {
      ...defaultWorkspaceManager.sourcereel,
      ...cloneDeep(payload)
    },
    sicp: {
      ...defaultWorkspaceManager.sicp,
      ...cloneDeep(payload)
    },
    stories: {
      ...defaultWorkspaceManager.stories,
      ...cloneDeep(payload)
    }
  };
}

describe('BROWSE_REPL_HISTORY_DOWN', () => {
  test('works on non-null browseIndex and returns replValue to last value on no further records', () => {
    const originalValue = 'browsing history';
    const records = ['first history', 'second history'];

    const replHistory = {
      browseIndex: 1,
      records,
      originalValue
    };

    const replDownDefaultState: WorkspaceManagerState = generateDefaultWorkspace({ replHistory });
    const actions = generateActions(WorkspaceActions.browseReplHistoryDown.type, { replHistory });

    actions.forEach(action => {
      let result = WorkspaceReducer(replDownDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...replDownDefaultState,
        [location]: {
          ...replDownDefaultState[location],
          replValue: replHistory.records[0],
          replHistory: {
            ...replHistory,
            browseIndex: 0
          }
        }
      });

      // no earlier records left, should set replValue to last value before browsing
      result = WorkspaceReducer(result, action);
      expect(result).toEqual({
        ...replDownDefaultState,
        [location]: {
          ...replDownDefaultState[location],
          replValue: originalValue,
          replHistory: {
            browseIndex: null,
            records,
            originalValue: ''
          }
        }
      });
    });
  });

  test('returns unchanged state on null browseIndex', () => {
    const originalValue = 'history';
    const records = ['first history', 'second history'];
    const replHistory = {
      browseIndex: null,
      records,
      originalValue
    };

    const replDownDefaultState: WorkspaceManagerState = generateDefaultWorkspace({ replHistory });
    const actions = generateActions(WorkspaceActions.browseReplHistoryDown.type, { replHistory });

    actions.forEach(action => {
      const result = WorkspaceReducer(replDownDefaultState, action);
      expect(result).toEqual(replDownDefaultState);
    });
  });
});

describe('BROWSE_REPL_HISTORY_UP', () => {
  test('works on non-null browseIndex and returns unchanged state when there is no more history', () => {
    const replValue = 'repl history';
    const records = ['first history', 'second history'];

    const replHistory = {
      browseIndex: null,
      records
    };

    const replUpDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      replHistory,
      replValue
    });
    const actions = generateActions(WorkspaceActions.browseReplHistoryUp.type, { replHistory });

    actions.forEach(action => {
      let result = WorkspaceReducer(replUpDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...replUpDefaultState,
        [location]: {
          ...replUpDefaultState[location],
          replValue: replHistory.records[0],
          replHistory: {
            records,
            browseIndex: 0,
            originalValue: replValue
          }
        }
      });

      // should advance browseIndex and update replValue
      result = WorkspaceReducer(result, action);
      expect(result).toEqual({
        ...replUpDefaultState,
        [location]: {
          ...replUpDefaultState[location],
          replValue: replHistory.records[1],
          replHistory: {
            records,
            browseIndex: 1,
            originalValue: replValue
          }
        }
      });

      // Should return unchanged state as we are at end of array
      result = WorkspaceReducer(result, action);
      expect(result).toEqual({
        ...replUpDefaultState,
        [location]: {
          ...replUpDefaultState[location],
          replValue: replHistory.records[1],
          replHistory: {
            records,
            browseIndex: 1,
            originalValue: replValue
          }
        }
      });
    });
  });
});

describe('CHANGE_EXTERNAL_LIBRARY', () => {
  test('sets externalLibrary correctly', () => {
    const newExternal = 'new_external_test' as ExternalLibraryName;
    const playgroundAction = {
      type: WorkspaceActions.changeExternalLibrary.type,
      payload: {
        newExternal,
        workspaceLocation: playgroundWorkspace
      }
    } as const;

    const result = WorkspaceReducer(defaultWorkspaceManager, playgroundAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      playground: {
        ...defaultWorkspaceManager.playground,
        externalLibrary: newExternal
      }
    });
  });
});

describe('CLEAR_REPL_INPUT', () => {
  test('clears replValue', () => {
    const replValue = 'test repl value';
    const clearReplDefaultState: WorkspaceManagerState = generateDefaultWorkspace({ replValue });
    const actions = generateActions(WorkspaceActions.clearReplInput.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(clearReplDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...clearReplDefaultState,
        [location]: {
          ...clearReplDefaultState[location],
          replValue: ''
        }
      });
    });
  });
});

describe('CLEAR_REPL_OUTPUT', () => {
  test('clears output', () => {
    const output: InterpreterOutput[] = [{ type: 'code', value: 'test repl input' }];
    const clearReplDefaultState: WorkspaceManagerState = generateDefaultWorkspace({ output });
    const actions = generateActions(WorkspaceActions.clearReplOutput.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(clearReplDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...clearReplDefaultState,
        [location]: {
          ...clearReplDefaultState[location],
          output: []
        }
      });
    });
  });
});

describe('CLEAR_REPL_OUTPUT_LAST', () => {
  test('removes the last entry from the REPL', () => {
    const output: InterpreterOutput[] = [
      {
        type: 'result',
        value: 'undefined',
        consoleLogs: ['hello', 'world']
      },
      {
        type: 'result',
        value: 420,
        consoleLogs: ['these', 'are', 'display', 'calls']
      }
    ];
    const clearReplLastPriorState: WorkspaceManagerState = generateDefaultWorkspace({ output });
    const actions = generateActions(WorkspaceActions.clearReplOutputLast.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(clearReplLastPriorState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...clearReplLastPriorState,
        [location]: {
          ...clearReplLastPriorState[location],
          output: [output[0]]
        }
      });
    });
  });
});

describe('DEBUG_RESET', () => {
  test('sets isRunning and isDebugging to false', () => {
    const isRunning = true;
    const isDebugging = true;
    const debugResetDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      isRunning,
      isDebugging
    });
    const actions = generateActions(InterpreterActions.debuggerReset.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(debugResetDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...debugResetDefaultState,
        [location]: {
          ...debugResetDefaultState[location],
          isRunning: false,
          isDebugging: false
        }
      });
    });
  });
});

describe('DEBUG_RESUME', () => {
  test('sets isRunning to true and isDebugging to false', () => {
    const isDebugging = true;
    const debugResumeDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      isDebugging
    });
    const actions = generateActions(InterpreterActions.debuggerResume.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(debugResumeDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...debugResumeDefaultState,
        [location]: {
          ...debugResumeDefaultState[location],
          isRunning: true,
          isDebugging: false
        }
      });
    });
  });
});

describe('END_CLEAR_CONTEXT', () => {
  test('sets context and globals correctly', () => {
    const mockGlobals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testString', 'who dat boi'],
      ['testBooleanTrue', true],
      ['testBooleanFalse', false],
      ['testBooleanUndefined', undefined],
      ['testBooleanNull', null],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    const library: Library = {
      chapter: Chapter.SOURCE_4,
      external: {
        name: 'SOUNDS' as ExternalLibraryName,
        symbols: []
      },
      globals: mockGlobals
    };

    const actions = generateActions(WorkspaceActions.endClearContext.type, { library });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      const context = createContext<WorkspaceLocation>(
        library.chapter,
        library.external.symbols,
        location,
        Variant.DEFAULT
      );

      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceManager,
          [location]: {
            ...defaultWorkspaceManager[location],
            context,
            globals: mockGlobals,
            externalLibrary: 'SOUNDS' as const
          }
        })
      );
    });
  });
});

describe('END_DEBUG_PAUSE', () => {
  test('sets isRunning to false and isDebugging to true', () => {
    const isRunning = true;
    const debugPauseDefaultState: WorkspaceManagerState = generateDefaultWorkspace({ isRunning });
    const actions = generateActions(InterpreterActions.endDebuggerPause.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(debugPauseDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...debugPauseDefaultState,
        [location]: {
          ...debugPauseDefaultState[location],
          isRunning: false,
          isDebugging: true
        }
      });
    });
  });
});

describe('END_INTERRUPT_EXECUTION', () => {
  test('sets isRunning and isDebugging to false', () => {
    const isRunning = true;
    const isDebugging = true;
    const interruptExecutionDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      isRunning,
      isDebugging
    });
    const actions = generateActions(InterpreterActions.endInterruptExecution.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(interruptExecutionDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...interruptExecutionDefaultState,
        [location]: {
          ...interruptExecutionDefaultState[location],
          isRunning: false,
          isDebugging: false
        }
      });
    });
  });
});

describe('EVAL_EDITOR', () => {
  test('sets isRunning to true and isDebugging to false', () => {
    const isDebugging = true;
    const evalEditorDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      isDebugging
    });
    const actions = generateActions(WorkspaceActions.evalEditor.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(evalEditorDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: true,
          isDebugging: false
        }
      });
    });
  });
});

// Test data for EVAL_INTERPRETER_ERROR, EVAL_INTERPRETER_SUCCESS, EVAL_TESTCASE_SUCCESS and HANDLE_CONSOLE_OUTPUT
const outputWithRunningOutput: RunningOutput[] = [
  { type: 'running', consoleLogs: ['console-log-test'] },
  { type: 'running', consoleLogs: ['console-log-test-2'] }
];

const outputWithRunningAndCodeOutput: InterpreterOutput[] = [
  { type: 'running', consoleLogs: ['console-log-test'] },
  { type: 'code', value: 'sample code' }
];

describe('EVAL_INTERPRETER_ERROR', () => {
  test('works correctly with RunningOutput', () => {
    const isRunning = true;
    const isDebugging = true;

    const evalEditorDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningOutput,
      isRunning,
      isDebugging
    });
    const actions = generateActions(InterpreterActions.evalInterpreterError.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(evalEditorDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          isDebugging: false,
          output: [{ ...outputWithRunningOutput[0] }, { consoleLogs: ['console-log-test-2'] }]
        }
      });
    });
  });

  test('works correctly with other outputs', () => {
    const isRunning = true;
    const isDebugging = true;
    const evalEditorDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningAndCodeOutput,
      isRunning,
      isDebugging
    });

    const actions = generateActions(InterpreterActions.evalInterpreterError.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(evalEditorDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          isDebugging: false,
          output: [
            { ...outputWithRunningAndCodeOutput[0] },
            { ...outputWithRunningAndCodeOutput[1] },
            { consoleLogs: [] }
          ]
        }
      });
    });
  });
});

describe('EVAL_INTERPRETER_SUCCESS', () => {
  test('works correctly with RunningOutput', () => {
    const isRunning = true;
    const breakpoints = ['1', '2'];
    const highlightedLines = [[3], [5]];

    const evalEditorDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningOutput,
      isRunning,
      editorTabs: [{ highlightedLines, breakpoints }]
    });

    const actions = generateActions(InterpreterActions.evalInterpreterSuccess.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(evalEditorDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          output: [
            { ...outputWithRunningOutput[0] },
            { consoleLogs: ['console-log-test-2'], value: 'undefined' }
          ]
        }
      });
    });
  });

  test('works correctly with other outputs', () => {
    const isRunning = true;
    const breakpoints = ['1', '2'];
    const highlightedLines = [[3], [5]];

    const evalEditorDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningAndCodeOutput,
      isRunning,
      editorTabs: [{ highlightedLines, breakpoints }]
    });

    const actions = generateActions(InterpreterActions.evalInterpreterSuccess.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(evalEditorDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          output: [
            { ...outputWithRunningAndCodeOutput[0] },
            { ...outputWithRunningAndCodeOutput[1] },
            { consoleLogs: [], value: 'undefined' }
          ]
        }
      });
    });
  });
});

describe('EVAL_REPL', () => {
  test('sets isRunning to true', () => {
    const actions = generateActions(WorkspaceActions.evalRepl.type);

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          isRunning: true
        }
      });
    });
  });
});

// Test data for EVAL_TESTCASE_FAILURE and EVAL_TESTCASE_SUCCESS
const outputWithCodeAndRunningOutput: InterpreterOutput[] = [
  { type: 'code', value: 'sample code' },
  { type: 'running', consoleLogs: ['console-log-test'] }
];

const outputWithCodeOutput: CodeOutput[] = [
  { type: 'code', value: 'code 1' },
  { type: 'code', value: 'code 2' }
];

const editorTestcases: Testcase[] = [
  {
    type: TestcaseTypes.public,
    answer: 'abc',
    score: 10,
    program: 'test program'
  },
  {
    type: TestcaseTypes.public,
    answer: 'def',
    score: 20,
    program: 'another program'
  }
];

describe('EVAL_TESTCASE_FAILURE', () => {
  test('sets editorTestcases correctly', () => {
    const value = 'test-value-failure';
    const evalFailureDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      editorTestcases
    });
    const actions = generateActions(InterpreterActions.evalTestcaseFailure.type, {
      value,
      index: 1
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(evalFailureDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalFailureDefaultState,
        [location]: {
          ...evalFailureDefaultState[location],
          editorTestcases: [
            { ...editorTestcases[0] },
            { ...editorTestcases[1], result: undefined, errors: value }
          ]
        }
      });
    });
  });
});

describe('EVAL_TESTCASE_SUCCESS', () => {
  test('works correctly on RunningOutput and CodeOutput', () => {
    const isRunning = true;
    const value = (outputWithCodeAndRunningOutput[0] as CodeOutput).value;
    const testcaseSuccessDefaultState = generateDefaultWorkspace({
      output: outputWithCodeAndRunningOutput,
      isRunning,
      editorTestcases
    });

    const actions = generateActions(InterpreterActions.evalTestcaseSuccess.type, {
      value,
      index: 1
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(testcaseSuccessDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...testcaseSuccessDefaultState,
        [location]: {
          ...testcaseSuccessDefaultState[location],
          isRunning: false,
          output: outputWithCodeAndRunningOutput,
          editorTestcases: [
            { ...editorTestcases[0] },
            { ...editorTestcases[1], result: value, errors: undefined }
          ]
        }
      });
    });
  });

  test('works correctly on other output', () => {
    const isRunning = true;
    const value = (outputWithCodeAndRunningOutput[0] as CodeOutput).value;
    const testcaseSuccessDefaultState = generateDefaultWorkspace({
      output: outputWithCodeOutput,
      isRunning,
      editorTestcases
    });

    const actions = generateActions(InterpreterActions.evalTestcaseSuccess.type, {
      value,
      index: 0
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(testcaseSuccessDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...testcaseSuccessDefaultState,
        [location]: {
          ...testcaseSuccessDefaultState[location],
          isRunning: false,
          output: outputWithCodeOutput,
          editorTestcases: [
            { ...editorTestcases[0], result: value, errors: undefined },
            { ...editorTestcases[1] }
          ]
        }
      });
    });
  });
});

describe('HANDLE_CONSOLE_LOG', () => {
  test('works correctly with RunningOutput', () => {
    const logString = 'test-log-string';
    const consoleLogDefaultState = generateDefaultWorkspace({ output: outputWithRunningOutput });
    const actions = generateActions(InterpreterActions.handleConsoleLog.type, {
      logString: [logString]
    });
    actions.forEach(action => {
      const result = WorkspaceReducer(cloneDeep(consoleLogDefaultState), action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;

      expect(result).toEqual({
        ...consoleLogDefaultState,
        [location]: {
          ...consoleLogDefaultState[location],
          output: [
            { ...outputWithRunningOutput[0] },
            {
              ...outputWithRunningOutput[1],
              consoleLogs: outputWithRunningOutput[1].consoleLogs.concat(logString)
            }
          ]
        }
      });
    });
  });

  test('works correctly with other output', () => {
    const logString = 'test-log-string-2';
    const consoleLogDefaultState = generateDefaultWorkspace({
      output: outputWithRunningAndCodeOutput
    });
    const actions = generateActions(InterpreterActions.handleConsoleLog.type, {
      logString: [logString]
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(consoleLogDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...consoleLogDefaultState,
        [location]: {
          ...consoleLogDefaultState[location],
          output: outputWithRunningAndCodeOutput.concat({
            type: 'running',
            consoleLogs: [logString]
          })
        }
      });
    });
  });

  test('works correctly with empty output', () => {
    const logString = 'test-log-string-3';
    const consoleLogDefaultState = generateDefaultWorkspace({ output: [] });

    const actions = generateActions(InterpreterActions.handleConsoleLog.type, {
      logString: [logString]
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(consoleLogDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...consoleLogDefaultState,
        [location]: {
          ...consoleLogDefaultState[location],
          output: [{ type: 'running', consoleLogs: [logString] }]
        }
      });
    });
  });
});

describe('LOG_OUT', () => {
  test('preserves playground workspace after logout', () => {
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const newPlayground: PlaygroundWorkspaceState = {
      ...defaultPlaygroundState,
      editorTabs: [
        {
          ...defaultPlaygroundState.editorTabs[0],
          highlightedLines: [
            [1, 2],
            [3, 4]
          ]
        }
      ],
      externalLibrary: 'NONE' as ExternalLibraryName,
      replValue: 'test repl value here',
      sharedbConnected: false,
      usingSubst: false,
      usingCse: false,
      usingUpload: false,
      updateCse: true,
      currentStep: -1,
      stepsTotal: 0,
      breakpointSteps: [],
      changepointSteps: []
    };

    const logoutDefaultState: WorkspaceManagerState = {
      ...defaultWorkspaceManager,
      playground: newPlayground
    };

    const playgroundAction = {
      type: CommonsActions.logOut.type,
      payload: {}
    } as const;

    const result = WorkspaceReducer(logoutDefaultState, playgroundAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      playground: newPlayground
    });
  });
});

describe('RESET_TESTCASE', () => {
  test('correctly resets the targeted testcase to its default state', () => {
    const resetTestcaseDefaultState = generateDefaultWorkspace({
      editorTestcases
    });

    const actions = generateActions(WorkspaceActions.resetTestcase.type, {
      index: 1
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(resetTestcaseDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...resetTestcaseDefaultState,
        [location]: {
          ...resetTestcaseDefaultState[location],
          editorTestcases: [
            { ...editorTestcases[0] },
            { ...editorTestcases[1], result: undefined, errors: undefined }
          ]
        }
      });
    });
  });
});

describe('RESET_WORKSPACE', () => {
  test('works correctly', () => {
    const resetWorkspaceDefaultState: WorkspaceManagerState = generateDefaultWorkspace({});

    const workspaceOptions = {
      editorTabs: [
        {
          highlightedLines: [[1], [10]],
          breakpoints: ['1', '3']
        }
      ],
      replValue: 'test repl value'
    };

    const actions = generateActions(WorkspaceActions.resetWorkspace.type, { workspaceOptions });

    actions.forEach(action => {
      const result = WorkspaceReducer(resetWorkspaceDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      const newContext = createDefaultWorkspace(location);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...resetWorkspaceDefaultState,
          [location]: {
            ...defaultWorkspaceManager[location],
            ...newContext,
            ...workspaceOptions,
            context: newContext.context
          }
        })
      );
    });
  });
});

describe('SEND_REPL_INPUT_TO_OUTPUT', () => {
  test('works correctly and pops replHistory when exceeding MAX_BROWSE_INDEX', () => {
    const replHistory = {
      browseIndex: null,
      records: Array.from(Array(Constants.maxBrowseIndex), (x, index) => index + '') // Create an array with size MAX_BROWSE_INDEX
    };

    const inputToOutputDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      replHistory
    });
    const newOutput = 'new-output-test';

    const actions = generateActions(WorkspaceActions.sendReplInputToOutput.type, {
      type: 'code',
      value: newOutput
    });

    const newArray = [newOutput].concat(replHistory.records);
    newArray.pop();

    actions.forEach(action => {
      const result = WorkspaceReducer(inputToOutputDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...inputToOutputDefaultState,
        [location]: {
          ...inputToOutputDefaultState[location],
          output: [
            {
              type: 'code',
              workspaceLocation: location,
              value: newOutput
            }
          ],
          replHistory: {
            ...replHistory,
            records: newArray
          }
        }
      });
    });
  });

  test('works correctly with empty newOutput value', () => {
    const replHistory = {
      browseIndex: null,
      records: ['record-1', 'record-2']
    };
    const inputToOutputDefaultState: WorkspaceManagerState = generateDefaultWorkspace({
      replHistory
    });
    const newOutput = '';

    const actions = generateActions(WorkspaceActions.sendReplInputToOutput.type, {
      type: 'code',
      value: newOutput
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(inputToOutputDefaultState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...inputToOutputDefaultState,
        [location]: {
          ...inputToOutputDefaultState[location],
          output: [{ type: 'code', workspaceLocation: location, value: newOutput }],
          replHistory
        }
      });
    });
  });
});

describe('SET_EDITOR_SESSION_ID', () => {
  test('sets editorSessionId correctly', () => {
    const editorSessionId = 'test_editor_session_id';
    const actions = generateActions(setEditorSessionId.type, { editorSessionId });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          editorSessionId
        }
      });
    });
  });
});

describe('SET_SHAREDB_CONNECTED', () => {
  test('sets sharedbConnected correctly', () => {
    const connected = true;
    const actions = generateActions(setSharedbConnected.type, { connected });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          sharedbConnected: connected
        }
      });
    });
  });
});

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('toggles isEditorAutorun correctly', () => {
    const actions = generateActions(WorkspaceActions.toggleEditorAutorun.type);

    actions.forEach(action => {
      let result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          isEditorAutorun: true
        }
      });

      result = WorkspaceReducer(result, action);
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          isEditorAutorun: false
        }
      });
    });
  });
});

describe('UPDATE_CURRENT_ASSESSMENT_ID', () => {
  test('sets currentAssessment and currentQuestion correctly', () => {
    const assessmentId = 3;
    const questionId = 7;
    const assessmentAction = {
      type: WorkspaceActions.updateCurrentAssessmentId.type,
      payload: { assessmentId, questionId }
    } as const;

    const result = WorkspaceReducer(defaultWorkspaceManager, assessmentAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      assessment: {
        ...defaultWorkspaceManager.assessment,
        currentAssessment: assessmentId,
        currentQuestion: questionId
      }
    });
  });
});

describe('UPDATE_CURRENT_SUBMISSION_ID', () => {
  test('sets currentSubmission and currentQuestion correctly', () => {
    const submissionId = 5;
    const questionId = 8;
    const assessmentAction = {
      type: WorkspaceActions.updateCurrentSubmissionId.type,
      payload: { submissionId, questionId }
    } as const;

    const result = WorkspaceReducer(defaultWorkspaceManager, assessmentAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      grading: {
        ...defaultWorkspaceManager.grading,
        currentSubmission: submissionId,
        currentQuestion: questionId
      }
    });
  });
});

describe('SET_FOLDER_MODE', () => {
  test('sets isFolderModeEnabled correctly', () => {
    const isFolderModeEnabled = true;
    const actions = generateActions(WorkspaceActions.setFolderMode.type, { isFolderModeEnabled });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          isFolderModeEnabled
        }
      });
    });
  });
});

describe('UPDATE_ACTIVE_EDITOR_TAB_INDEX', () => {
  const editorTabs: EditorTabState[] = [
    {
      value: 'Hello World!',
      highlightedLines: [],
      breakpoints: []
    },
    {
      value: 'Goodbye World!',
      highlightedLines: [],
      breakpoints: []
    }
  ];

  test('throws an error if the active editor tab index is negative', () => {
    const activeEditorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateActiveEditorTabIndex.type, {
      activeEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Active editor tab index must be non-negative!');
    });
  });

  test('sets the active editor tab index if it is within bounds', () => {
    const activeEditorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateActiveEditorTabIndex.type, {
      activeEditorTabIndex
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex,
            editorTabs
          }
        })
      );
    });
  });

  test('throws an error if the active editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const activeEditorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateActiveEditorTabIndex.type, {
      activeEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Active editor tab index must have a corresponding editor tab!');
    });
  });
});

describe('UPDATE_ACTIVE_EDITOR_TAB', () => {
  const activeEditorTabOptions: Partial<EditorTabState> = {
    value: 'Goodbye World!'
  };

  test('overrides the active editor tab correctly', () => {
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs: [
        {
          value: 'Hello World!',
          highlightedLines: [],
          breakpoints: []
        },
        {
          value: 'Goodbye World!',
          highlightedLines: [],
          breakpoints: []
        }
      ]
    });

    const actions = generateActions(WorkspaceActions.updateActiveEditorTab.type, {
      activeEditorTabOptions
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      const newContext = createDefaultWorkspace(location);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            ...newContext,
            activeEditorTabIndex: 1,
            editorTabs: [
              {
                value: 'Hello World!',
                highlightedLines: [],
                breakpoints: []
              },
              {
                ...activeEditorTabOptions,
                highlightedLines: [],
                breakpoints: []
              }
            ],
            context: newContext.context
          }
        })
      );
    });
  });

  test('does nothing when there is no active editor tab', () => {
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: null,
      editorTabs: []
    });

    const actions = generateActions(WorkspaceActions.updateActiveEditorTab.type, {
      activeEditorTabOptions
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      expect(result).toEqual(defaultWorkspaceState);
    });
  });
});

describe('UPDATE_EDITOR_VALUE', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];
  const newEditorValue = 'The quick brown fox jumps over the lazy dog.';

  test('throws an error if the editor tab index is negative', () => {
    const editorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateEditorValue.type, {
      editorTabIndex,
      newEditorValue
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must be non-negative!');
    });
  });

  test('throws an error if the editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const editorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateEditorValue.type, {
      editorTabIndex,
      newEditorValue
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must have a corresponding editor tab!');
    });
  });

  test('updates the value of the specified editor tab if the editor tab index is valid', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.updateEditorValue.type, {
      editorTabIndex,
      newEditorValue
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceState,
        [location]: {
          ...defaultWorkspaceState[location],
          editorTabs: [zerothEditorTab, { ...firstEditorTab, value: newEditorValue }]
        }
      });
    });
  });
});

describe('UPDATE_EDITOR_BREAKPOINTS', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];
  const newBreakpoints = [null, null, 'ace_breakpoint', null, 'ace_breakpoint'];

  test('throws an error if the editor tab index is negative', () => {
    const editorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorBreakpoint.type, {
      editorTabIndex,
      newBreakpoints
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must be non-negative!');
    });
  });

  test('throws an error if the editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const editorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorBreakpoint.type, {
      editorTabIndex,
      newBreakpoints
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must have a corresponding editor tab!');
    });
  });

  test('updates the breakpoints of the specified editor tab if the editor tab index is valid', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorBreakpoint.type, {
      editorTabIndex,
      newBreakpoints
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceState,
        [location]: {
          ...defaultWorkspaceState[location],
          editorTabs: [zerothEditorTab, { ...firstEditorTab, breakpoints: newBreakpoints }]
        }
      });
    });
  });
});

describe('UPDATE_EDITOR_HIGHLIGHTED_LINES', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];
  const newHighlightedLines: HighlightedLines[] = [
    [1, 3],
    [6, 9]
  ];

  test('throws an error if the editor tab index is negative', () => {
    const editorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorHighlightedLines.type, {
      editorTabIndex,
      newHighlightedLines
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must be non-negative!');
    });
  });

  test('throws an error if the editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const editorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorHighlightedLines.type, {
      editorTabIndex,
      newHighlightedLines
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must have a corresponding editor tab!');
    });
  });

  test('updates the highlighted lines of the specified editor tab if the editor tab index is valid', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.setEditorHighlightedLines.type, {
      editorTabIndex,
      newHighlightedLines
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceState,
        [location]: {
          ...defaultWorkspaceState[location],
          editorTabs: [
            zerothEditorTab,
            { ...firstEditorTab, highlightedLines: newHighlightedLines }
          ]
        }
      });
    });
  });
});

describe('MOVE_CURSOR', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];
  const newCursorPosition: Position = {
    row: 2,
    column: 5
  };

  test('throws an error if the editor tab index is negative', () => {
    const editorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.moveCursor.type, {
      editorTabIndex,
      newCursorPosition
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must be non-negative!');
    });
  });

  test('throws an error if the editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const editorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.moveCursor.type, {
      editorTabIndex,
      newCursorPosition
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must have a corresponding editor tab!');
    });
  });

  test('updates the cursor position of the specified editor tab if the editor tab index is valid', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.moveCursor.type, {
      editorTabIndex,
      newCursorPosition
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceState,
        [location]: {
          ...defaultWorkspaceState[location],
          editorTabs: [zerothEditorTab, { ...firstEditorTab, newCursorPosition }]
        }
      });
    });
  });
});

describe('ADD_EDITOR_TAB', () => {
  const zerothEditorTab: EditorTabState = {
    filePath: '/helloworld.js',
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    filePath: '/goodbyeworld.js',
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];

  test('adds a new editor tab to the back & sets it as the active editor tab', () => {
    const filePath = '/playground/interpreter.js';
    const editorValue = 'The quick brown fox jumped over the lazy pomeranian.';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.addEditorTab.type, { filePath, editorValue });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceState[location],
            activeEditorTabIndex: 2,
            editorTabs: [
              zerothEditorTab,
              firstEditorTab,
              { filePath, value: editorValue, highlightedLines: [], breakpoints: [] }
            ]
          }
        })
      );
    });
  });

  test('sets the active editor tab index if the file is already open as an editor tab', () => {
    const filePath = '/goodbyeworld.js';
    const editorValue = 'The quick brown fox jumped over the lazy pomeranian.';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.addEditorTab.type, { filePath, editorValue });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceState[location],
            activeEditorTabIndex: 1
          }
        })
      );
    });
  });
});

describe('SHIFT_EDITOR_TAB', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const secondEditorTab: EditorTabState = {
    value: 'Hello World Again!',
    highlightedLines: [],
    breakpoints: []
  };
  const thirdEditorTab: EditorTabState = {
    value: 'Goodbye World Again!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [
    zerothEditorTab,
    firstEditorTab,
    secondEditorTab,
    thirdEditorTab
  ];

  test('throws an error if the previous editor tab index is negative', () => {
    const previousEditorTabIndex = -1;
    const newEditorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Previous editor tab index must be non-negative!');
    });
  });

  test('throws an error if the previous editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const previousEditorTabIndex = 4;
    const newEditorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow(
        'Previous editor tab index must have a corresponding editor tab!'
      );
    });
  });

  test('throws an error if the new editor tab index is negative', () => {
    const previousEditorTabIndex = 2;
    const newEditorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('New editor tab index must be non-negative!');
    });
  });

  test('throws an error if the new editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const previousEditorTabIndex = 2;
    const newEditorTabIndex = 4;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('New editor tab index must have a corresponding editor tab!');
    });
  });

  test('shifts the (inactive) editor tab at the old index to the new index without changing the active editor tab index', () => {
    const previousEditorTabIndex = 2;
    const newEditorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceState[location],
            editorTabs: [zerothEditorTab, secondEditorTab, firstEditorTab, thirdEditorTab]
          }
        })
      );
    });
  });

  test('shifts the (active) editor tab at the old index to the new index without changing the active editor tab index', () => {
    const previousEditorTabIndex = 2;
    const newEditorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: previousEditorTabIndex,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.shiftEditorTab.type, {
      previousEditorTabIndex,
      newEditorTabIndex
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceState[location],
            activeEditorTabIndex: newEditorTabIndex,
            editorTabs: [zerothEditorTab, secondEditorTab, firstEditorTab, thirdEditorTab]
          }
        })
      );
    });
  });
});

describe('REMOVE_EDITOR_TAB', () => {
  const zerothEditorTab: EditorTabState = {
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];

  test('throws an error if the editor tab index is negative', () => {
    const editorTabIndex = -1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must be non-negative!');
    });
  });

  test('throws an error if the editor tab index is non-negative but does not have a corresponding editor tab', () => {
    const editorTabIndex = 2;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const resultThunk = () => WorkspaceReducer(defaultWorkspaceState, action);
      expect(resultThunk).toThrow('Editor tab index must have a corresponding editor tab!');
    });
  });

  test('removes the editor tab & sets the active editor tab index to null if there is only one editor tab', () => {
    const editorTabIndex = 0;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs: [zerothEditorTab]
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: null,
            editorTabs: []
          }
        })
      );
    });
  });

  test('removes the editor tab & leaves the active editor tab index unchanged if it is not the removed editor tab and has a smaller index', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab & decrements the active editor tab index by 1 if it is not the removed editor tab and has a larger index', () => {
    const editorTabIndex = 0;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [firstEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab & sets the active editor tab index to 0 if the removed editor tab index is 0 if the removed tab is the active tab', () => {
    const editorTabIndex = 0;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [firstEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab & sets the active editor tab index to 1 lower than the removed editor tab index if the removed editor tab index is not 0 if the removed tab is the active tab', () => {
    const editorTabIndex = 1;
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTab.type, { editorTabIndex });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab]
          }
        })
      );
    });
  });
});

describe('REMOVE_EDITOR_TAB_FOR_FILE', () => {
  const zerothEditorTab: EditorTabState = {
    filePath: '/a.js',
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    filePath: '/b.js',
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];

  test('does nothing if there are no editor tabs that correspond to the removed file path', () => {
    const removedFilePath = '/c.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(JSON.stringify(defaultWorkspaceState));
    });
  });

  test('removes the editor tab corresponding to the removed file path & sets the active editor tab index to null if there is only one editor tab', () => {
    const removedFilePath = '/a.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs: [zerothEditorTab]
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: null,
            editorTabs: []
          }
        })
      );
    });
  });

  test('removes the editor tab corresponding to the removed file path & leaves the active editor tab index unchanged if it is not the removed editor tab and has a smaller index', () => {
    const removedFilePath = '/b.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab corresponding to the removed file path & decrements the active editor tab index by 1 if it is not the removed editor tab and has a larger index', () => {
    const removedFilePath = '/a.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [firstEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab corresponding to the removed file path & sets the active editor tab index to 0 if the removed editor tab index is 0 if the removed tab is the active tab', () => {
    const removedFilePath = '/a.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [firstEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tab corresponding to the removed file path & sets the active editor tab index to 1 lower than the removed editor tab index if the removed editor tab index is not 0 if the removed tab is the active tab', () => {
    const removedFilePath = '/b.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabForFile.type, {
      removedFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab]
          }
        })
      );
    });
  });
});

describe('REMOVE_EDITOR_TABS_FOR_DIRECTORY', () => {
  const zerothEditorTab: EditorTabState = {
    filePath: '/dir1/dir3/a.js',
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    filePath: '/dir1/dir2/a.js',
    value: 'Hello World Again!',
    highlightedLines: [],
    breakpoints: []
  };
  const secondEditorTab: EditorTabState = {
    filePath: '/dir1/b.js',
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const thirdEditorTab: EditorTabState = {
    filePath: '/dir1/dir2/b.js',
    value: 'Goodbye World Again!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [
    zerothEditorTab,
    firstEditorTab,
    secondEditorTab,
    thirdEditorTab
  ];

  test('does nothing if there are no editor tabs that correspond to the removed directory path', () => {
    const removedDirectoryPath = '/dir3';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(JSON.stringify(defaultWorkspaceState));
    });
  });

  test('removes the editor tabs corresponding to the removed directory path & sets the active editor tab index to null if there are none left', () => {
    const removedDirectoryPath = '/dir1';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: null,
            editorTabs: []
          }
        })
      );
    });
  });

  test('removes the editor tabs corresponding to the removed directory path & leaves the active editor tab index unchanged if it is not one of the removed editor tabs and has a smaller index', () => {
    const removedDirectoryPath = '/dir1/dir2';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab, secondEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tabs corresponding to the removed directory path & decrements the active editor tab index if it is not one of the removed editor tabs and has a larger index', () => {
    const removedDirectoryPath = '/dir1/dir2';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 2,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 1,
            editorTabs: [zerothEditorTab, secondEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tabs corresponding to the removed directory path & sets the active editor tab index to 0 if one of the removed editor tab indices is 0 and is the active tab', () => {
    const removedDirectoryPath = '/dir1/dir3';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [firstEditorTab, secondEditorTab, thirdEditorTab]
          }
        })
      );
    });
  });

  test('removes the editor tabs corresponding to the removed directory path & sets the active editor tab index to 1 lower than the removed editor tab index if the removed editor tab index is not 0 and is the active tab', () => {
    const removedDirectoryPath = '/dir1/dir2';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 1,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.removeEditorTabsForDirectory.type, {
      removedDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            activeEditorTabIndex: 0,
            editorTabs: [zerothEditorTab, secondEditorTab]
          }
        })
      );
    });
  });
});

describe('RENAME_EDITOR_TAB_FOR_FILE', () => {
  const zerothEditorTab: EditorTabState = {
    filePath: '/a.js',
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    filePath: '/b.js',
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab];

  test('does nothing if there are no editor tabs that correspond to the old file path', () => {
    const oldFilePath = '/c.js';
    const newFilePath = '/d.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.renameEditorTabForFile.type, {
      oldFilePath,
      newFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(JSON.stringify(defaultWorkspaceState));
    });
  });

  test('renames the file path of the editor tab corresponding to the old file path to the new file path', () => {
    const oldFilePath = '/b.js';
    const newFilePath = '/d.js';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      activeEditorTabIndex: 0,
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.renameEditorTabForFile.type, {
      oldFilePath,
      newFilePath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            editorTabs: [zerothEditorTab, { ...firstEditorTab, filePath: newFilePath }]
          }
        })
      );
    });
  });
});

describe('RENAME_EDITOR_TABS_FOR_DIRECTORY', () => {
  const zerothEditorTab: EditorTabState = {
    filePath: '/dir1/a.js',
    value: 'Hello World!',
    highlightedLines: [],
    breakpoints: []
  };
  const firstEditorTab: EditorTabState = {
    filePath: '/dir2/b.js',
    value: 'Goodbye World!',
    highlightedLines: [],
    breakpoints: []
  };
  const secondEditorTab: EditorTabState = {
    value: 'The quick brown fox jumped over the lazy pomeranian.',
    highlightedLines: [],
    breakpoints: []
  };
  const editorTabs: EditorTabState[] = [zerothEditorTab, firstEditorTab, secondEditorTab];

  test('does nothing if there are no editor tabs that correspond to the old directory path', () => {
    const oldDirectoryPath = '/dir3';
    const newDirectoryPath = '/dir4';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.renameEditorTabsForDirectory.type, {
      oldDirectoryPath,
      newDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(JSON.stringify(defaultWorkspaceState));
    });
  });

  test('renames the file path of editor tabs that start with the old directory path by replacing with the new directory path', () => {
    const oldDirectoryPath = '/dir2';
    const newDirectoryPath = '/dir4';
    const defaultWorkspaceState: WorkspaceManagerState = generateDefaultWorkspace({
      editorTabs
    });

    const actions = generateActions(WorkspaceActions.renameEditorTabsForDirectory.type, {
      oldDirectoryPath,
      newDirectoryPath
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceState, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      // Note: we stringify because context contains functions which cause
      // the two to compare unequal; stringifying strips functions
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          ...defaultWorkspaceState,
          [location]: {
            ...defaultWorkspaceManager[location],
            editorTabs: [
              zerothEditorTab,
              {
                ...firstEditorTab,
                filePath: firstEditorTab.filePath?.replace(oldDirectoryPath, newDirectoryPath)
              },
              secondEditorTab
            ]
          }
        })
      );
    });
  });
});

describe('UPDATE_HAS_UNSAVED_CHANGES', () => {
  test('sets hasUnsavedChanges correctly', () => {
    const hasUnsavedChanges = true;
    const actions = generateActions(WorkspaceActions.updateHasUnsavedChanges.type, {
      hasUnsavedChanges
    });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          hasUnsavedChanges: true
        }
      });
    });
  });
});

describe('UPDATE_REPL_VALUE', () => {
  test('sets replValue correctly', () => {
    const newReplValue = 'test new repl value';
    const actions = generateActions(WorkspaceActions.updateReplValue.type, { newReplValue });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          replValue: newReplValue
        }
      });
    });
  });
});

describe('TOGGLE_USING_SUBST', () => {
  test('sets usingSubst correctly', () => {
    const usingSubst = true;
    const actions = generateActions(WorkspaceActions.toggleUsingSubst.type, { usingSubst });

    actions.forEach(action => {
      const result = WorkspaceReducer(defaultWorkspaceManager, action);
      const location: WorkspaceLocation = action.payload.workspaceLocation;

      const expectedResult =
        location === playgroundWorkspace || location === sicpWorkspace
          ? {
              ...defaultWorkspaceManager,
              [location]: {
                ...defaultWorkspaceManager[location],
                usingSubst: true
              }
            }
          : { ...defaultWorkspaceManager };

      expect(result).toEqual(expectedResult);
    });
  });
});

// TODO: Add toggleusingcse
