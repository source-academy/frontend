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
  UPDATE_REPL_VALUE
} from '../../actions/actionTypes';
import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import { ITestcase, Library } from '../../components/assessment/assessmentShape';
import { createContext } from '../../utils/slangHelper';
import {
  CodeOutput,
  createDefaultWorkspace,
  defaultWorkspaceManager,
  InterpreterOutput,
  IPlaygroundWorkspace,
  IWorkspaceManagerState,
  maxBrowseIndex,
  RunningOutput
} from '../states';
import { reducer } from '../workspaces';

const assessmentWorkspace: WorkspaceLocation = WorkspaceLocations.assessment;
const gradingWorkspace: WorkspaceLocation = WorkspaceLocations.grading;
const playgroundWorkspace: WorkspaceLocation = WorkspaceLocations.playground;

function generateActions(type: string, payload: any = {}): IAction[] {
  return [
    {
      type,
      payload: {
        ...payload,
        workspaceLocation: assessmentWorkspace
      }
    },
    {
      type,
      payload: {
        ...payload,
        workspaceLocation: gradingWorkspace
      }
    },
    {
      type,
      payload: {
        ...payload,
        workspaceLocation: playgroundWorkspace
      }
    }
  ];
}

function generateDefaultWorkspace(payload: any = {}): IWorkspaceManagerState {
  return {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      ...payload
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      ...payload
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      ...payload
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

    const replDownDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ replHistory });
    const actions: IAction[] = generateActions(BROWSE_REPL_HISTORY_DOWN, { replHistory });

    actions.forEach(action => {
      let result = reducer(replDownDefaultState, action);
      const location = action.payload.workspaceLocation;
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
      result = reducer(result, action);
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

    const replDownDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ replHistory });
    const actions: IAction[] = generateActions(BROWSE_REPL_HISTORY_DOWN, { replHistory });

    actions.forEach(action => {
      const result = reducer(replDownDefaultState, action);
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

    const replUpDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      replHistory,
      replValue
    });
    const actions: IAction[] = generateActions(BROWSE_REPL_HISTORY_UP, { replHistory });

    actions.forEach(action => {
      let result = reducer(replUpDefaultState, action);
      const location = action.payload.workspaceLocation;
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
      result = reducer(result, action);
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
      result = reducer(result, action);
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

describe('CHANGE_ACTIVE_TAB', () => {
  test('sets sideContentActiveTab correctly', () => {
    const activeTab = 2;
    const actions: IAction[] = generateActions(CHANGE_ACTIVE_TAB, { activeTab });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          sideContentActiveTab: activeTab
        }
      });
    });
  });
});

describe('CHANGE_EDITOR_HEIGHT', () => {
  test('sets editorHeight correctly', () => {
    const height = 200;
    const actions: IAction[] = generateActions(CHANGE_EDITOR_HEIGHT, { height });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          editorHeight: height
        }
      });
    });
  });
});

describe('CHANGE_EDITOR_WIDTH', () => {
  test('sets editorWidth correctly', () => {
    const widthChange = 20.5;
    const actions: IAction[] = generateActions(CHANGE_EDITOR_WIDTH, { widthChange });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          editorWidth: '70.5%'
        }
      });
    });
  });
});

describe('CHANGE_PLAYGROUND_EXTERNAL', () => {
  test('sets playgroundExternal correctly', () => {
    const newExternal = 'new_external_test';
    const playgroundAction: IAction = {
      type: CHANGE_PLAYGROUND_EXTERNAL,
      payload: {
        newExternal,
        workspaceLocation: playgroundWorkspace
      }
    };

    const result = reducer(defaultWorkspaceManager, playgroundAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      playground: {
        ...defaultWorkspaceManager.playground,
        playgroundExternal: newExternal
      }
    });
  });
});

describe('CHANGE_SIDE_CONTENT_HEIGHT', () => {
  test('sets sideContentHeight correctly', () => {
    const height = 100;
    const actions: IAction[] = generateActions(CHANGE_SIDE_CONTENT_HEIGHT, { height });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          sideContentHeight: height
        }
      });
    });
  });
});

describe('CLEAR_REPL_INPUT', () => {
  test('clears replValue', () => {
    const replValue = 'test repl value';
    const clearReplDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ replValue });
    const actions: IAction[] = generateActions(CLEAR_REPL_INPUT);

    actions.forEach(action => {
      const result = reducer(clearReplDefaultState, action);
      const location = action.payload.workspaceLocation;
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
    const output: InterpreterOutput[] = [
      {
        type: 'code',
        value: 'test repl input'
      }
    ];
    const clearReplDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ output });
    const actions: IAction[] = generateActions(CLEAR_REPL_OUTPUT);

    actions.forEach(action => {
      const result = reducer(clearReplDefaultState, action);
      const location = action.payload.workspaceLocation;
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

describe('DEBUG_RESET', () => {
  test('sets isRunning and isDebugging to false', () => {
    const isRunning = true;
    const isDebugging = true;
    const debugResetDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      isRunning,
      isDebugging
    });
    const actions: IAction[] = generateActions(DEBUG_RESET);

    actions.forEach(action => {
      const result = reducer(debugResetDefaultState, action);
      const location = action.payload.workspaceLocation;
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
    const debugResumeDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      isDebugging
    });
    const actions: IAction[] = generateActions(DEBUG_RESUME);

    actions.forEach(action => {
      const result = reducer(debugResumeDefaultState, action);
      const location = action.payload.workspaceLocation;
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
      chapter: 4,
      external: {
        name: 'SOUNDS',
        symbols: []
      },
      globals: mockGlobals
    };

    const actions: IAction[] = generateActions(END_CLEAR_CONTEXT, { library });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      const context = createContext<WorkspaceLocation>(
        library.chapter,
        library.external.symbols,
        location
      );

      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          context: {
            ...context,
            runtime: expect.anything(),
            contextId: expect.any(Number)
          },
          globals: mockGlobals
        }
      });
    });
  });
});

describe('END_DEBUG_PAUSE', () => {
  test('sets isRunning to false and isDebugging to true', () => {
    const isRunning = true;
    const debugPauseDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ isRunning });
    const actions: IAction[] = generateActions(END_DEBUG_PAUSE);

    actions.forEach(action => {
      const result = reducer(debugPauseDefaultState, action);
      const location = action.payload.workspaceLocation;
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
    const interruptExecutionDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      isRunning,
      isDebugging
    });
    const actions: IAction[] = generateActions(END_INTERRUPT_EXECUTION);

    actions.forEach(action => {
      const result = reducer(interruptExecutionDefaultState, action);
      const location = action.payload.workspaceLocation;
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
    const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      isDebugging
    });
    const actions: IAction[] = generateActions(EVAL_EDITOR);

    actions.forEach(action => {
      const result = reducer(evalEditorDefaultState, action);
      const location = action.payload.workspaceLocation;
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
  {
    type: 'running',
    consoleLogs: ['console-log-test']
  },
  {
    type: 'running',
    consoleLogs: ['console-log-test-2']
  }
];

const outputWithRunningAndCodeOutput: InterpreterOutput[] = [
  {
    type: 'running',
    consoleLogs: ['console-log-test']
  },
  {
    type: 'code',
    value: 'sample code'
  }
];

describe('EVAL_INTERPRETER_ERROR', () => {
  test('works correctly with RunningOutput', () => {
    const isRunning = true;
    const isDebugging = true;

    const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningOutput,
      isRunning,
      isDebugging
    });
    const actions: IAction[] = generateActions(EVAL_INTERPRETER_ERROR);

    actions.forEach(action => {
      const result = reducer(evalEditorDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          isDebugging: false,
          output: [
            {
              ...outputWithRunningOutput[0]
            },
            {
              workspaceLocation: undefined,
              consoleLogs: ['console-log-test-2']
            }
          ]
        }
      });
    });
  });

  test('works correctly with other outputs', () => {
    const isRunning = true;
    const isDebugging = true;
    const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningAndCodeOutput,
      isRunning,
      isDebugging
    });

    const actions: IAction[] = generateActions(EVAL_INTERPRETER_ERROR);

    actions.forEach(action => {
      const result = reducer(evalEditorDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          isDebugging: false,
          output: [
            {
              ...outputWithRunningAndCodeOutput[0]
            },
            {
              ...outputWithRunningAndCodeOutput[1]
            },
            {
              workspaceLocation: undefined,
              consoleLogs: []
            }
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

    const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningOutput,
      isRunning,
      breakpoints,
      highlightedLines
    });

    const actions: IAction[] = generateActions(EVAL_INTERPRETER_SUCCESS);

    actions.forEach(action => {
      const result = reducer(evalEditorDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          breakpoints: [],
          highlightedLines: [],
          output: [
            {
              ...outputWithRunningOutput[0]
            },
            {
              workspaceLocation: undefined,
              consoleLogs: ['console-log-test-2']
            }
          ]
        }
      });
    });
  });

  test('works correctly with other outputs', () => {
    const isRunning = true;
    const breakpoints = ['1', '2'];
    const highlightedLines = [[3], [5]];

    const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      output: outputWithRunningAndCodeOutput,
      isRunning,
      breakpoints,
      highlightedLines
    });

    const actions: IAction[] = generateActions(EVAL_INTERPRETER_SUCCESS);

    actions.forEach(action => {
      const result = reducer(evalEditorDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalEditorDefaultState,
        [location]: {
          ...evalEditorDefaultState[location],
          isRunning: false,
          breakpoints: [],
          highlightedLines: [],
          output: [
            {
              ...outputWithRunningAndCodeOutput[0]
            },
            {
              ...outputWithRunningAndCodeOutput[1]
            },
            {
              workspaceLocation: undefined,
              consoleLogs: []
            }
          ]
        }
      });
    });
  });
});

describe('EVAL_REPL', () => {
  test('sets isRunning to true', () => {
    const actions: IAction[] = generateActions(EVAL_REPL);

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
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
  {
    type: 'code',
    value: 'sample code'
  },
  {
    type: 'running',
    consoleLogs: ['console-log-test']
  }
];

const outputWithCodeOutput: CodeOutput[] = [
  {
    type: 'code',
    value: 'code 1'
  },
  {
    type: 'code',
    value: 'code 2'
  }
];

const editorTestcases: ITestcase[] = [
  {
    answer: 'abc',
    score: 10,
    program: 'test program'
  },
  {
    answer: 'def',
    score: 20,
    program: 'another program'
  }
];

describe('EVAL_TESTCASE_FAILURE', () => {
  test('sets editorTestcases correctly', () => {
    const value = 'test-value-failure';
    const evalFailureDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      editorTestcases
    });
    const actions: IAction[] = generateActions(EVAL_TESTCASE_FAILURE, {
      value,
      index: 1
    });

    actions.forEach(action => {
      const result = reducer(evalFailureDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...evalFailureDefaultState,
        [location]: {
          ...evalFailureDefaultState[location],
          editorTestcases: [
            {
              ...editorTestcases[0]
            },
            {
              ...editorTestcases[1],
              result: value
            }
          ]
        }
      });
    });
  });
});

describe('EVAL_TESTCASE_SUCCESS', () => {
  test('works correctly on RunningOutput and CodeOutput', () => {
    const isRunning = true;
    const testcaseSuccessDefaultState = generateDefaultWorkspace({
      output: outputWithCodeAndRunningOutput,
      isRunning,
      editorTestcases
    });

    const actions: IAction[] = generateActions(EVAL_TESTCASE_SUCCESS, {
      index: 1
    });

    actions.forEach(action => {
      const result = reducer(testcaseSuccessDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...testcaseSuccessDefaultState,
        [location]: {
          ...testcaseSuccessDefaultState[location],
          isRunning: false,
          output: outputWithCodeAndRunningOutput,
          editorTestcases: [
            {
              ...editorTestcases[0]
            },
            {
              ...editorTestcases[1],
              result: (outputWithCodeAndRunningOutput[0] as CodeOutput).value
            }
          ]
        }
      });
    });
  });

  test('works correctly on other output', () => {
    const isRunning = true;
    const testcaseSuccessDefaultState = generateDefaultWorkspace({
      output: outputWithCodeOutput,
      isRunning,
      editorTestcases
    });

    const actions: IAction[] = generateActions(EVAL_TESTCASE_SUCCESS, {
      index: 0
    });

    actions.forEach(action => {
      const result = reducer(testcaseSuccessDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...testcaseSuccessDefaultState,
        [location]: {
          ...testcaseSuccessDefaultState[location],
          isRunning: false,
          output: outputWithCodeOutput,
          editorTestcases: [
            {
              ...editorTestcases[0],
              result: outputWithCodeOutput[0].value
            },
            {
              ...editorTestcases[1]
            }
          ]
        }
      });
    });
  });
});

describe('INIT_INVITE', () => {
  test('sets sharedbAceInitValue and sharedbAceIsInviting correctly', () => {
    const sharedbAceInitValue = 'test sharedbAce init value';
    const actions: IAction[] = generateActions(INIT_INVITE, {
      editorValue: sharedbAceInitValue
    });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          sharedbAceInitValue,
          sharedbAceIsInviting: true
        }
      });
    });
  });
});

describe('HANDLE_CONSOLE_LOG', () => {
  test('works correctly with RunningOutput', () => {
    const logString = 'test-log-string';
    const consoleLogDefaultState = generateDefaultWorkspace({ output: outputWithRunningOutput });
    const actions: IAction[] = generateActions(HANDLE_CONSOLE_LOG, { logString });

    actions.forEach(action => {
      const result = reducer(consoleLogDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...consoleLogDefaultState,
        [location]: {
          ...consoleLogDefaultState[location],
          output: [
            {
              ...outputWithRunningOutput[0]
            },
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
    const actions: IAction[] = generateActions(HANDLE_CONSOLE_LOG, { logString });

    actions.forEach(action => {
      const result = reducer(consoleLogDefaultState, action);
      const location = action.payload.workspaceLocation;
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

    const actions: IAction[] = generateActions(HANDLE_CONSOLE_LOG, { logString });

    actions.forEach(action => {
      const result = reducer(consoleLogDefaultState, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...consoleLogDefaultState,
        [location]: {
          ...consoleLogDefaultState[location],
          output: [
            {
              type: 'running',
              consoleLogs: [logString]
            }
          ]
        }
      });
    });
  });
});

describe('HIGHLIGHT_LINE', () => {
  test('sets highlightedLines correctly', () => {
    const highlightedLines = [12, 34, 56];
    const actions: IAction[] = generateActions(HIGHLIGHT_LINE, { highlightedLines });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          highlightedLines
        }
      });
    });
  });
});

describe('FINISH_INVITE', () => {
  test('sets sharedbAceIsInviting to false', () => {
    const actions: IAction[] = generateActions(FINISH_INVITE);

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          sharedbAceIsInviting: false
        }
      });
    });
  });
});

describe('LOG_OUT', () => {
  test('preserves playground workspace after logout', () => {
    const newPlayground: IPlaygroundWorkspace = {
      ...createDefaultWorkspace(WorkspaceLocations.playground),
      editorHeight: 200,
      editorValue: 'test program here',
      highlightedLines: [[1, 2], [3, 4]],
      playgroundExternal: 'NONE',
      replValue: 'test repl value here',
      websocketStatus: 0
    };

    const logoutDefaultState: IWorkspaceManagerState = {
      ...defaultWorkspaceManager,
      playground: newPlayground
    };

    const playgroundAction: IAction = {
      type: LOG_OUT,
      payload: {}
    };

    const result = reducer(logoutDefaultState, playgroundAction);
    expect(result).toEqual({
      ...defaultWorkspaceManager,
      playground: newPlayground
    });
  });
});

describe('RESET_WORKSPACE', () => {
  test('works correctly', () => {
    const editorHeight = 200;
    const editorWidth = '70%';
    const resetWorkspaceDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      editorHeight,
      editorWidth
    });

    const workspaceOptions = {
      breakpoints: ['1', '3'],
      highlightedLines: [[1], [10]],
      replValue: 'test repl value'
    };

    const actions: IAction[] = generateActions(RESET_WORKSPACE, { workspaceOptions });

    actions.forEach(action => {
      const result = reducer(resetWorkspaceDefaultState, action);
      const location = action.payload.workspaceLocation;
      const newContext = createDefaultWorkspace(location);
      expect(result).toEqual({
        ...resetWorkspaceDefaultState,
        [location]: {
          ...defaultWorkspaceManager[location],
          ...newContext,
          ...workspaceOptions,
          context: {
            ...newContext.context,
            runtime: expect.anything(),
            contextId: expect.any(Number)
          }
        }
      });
    });
  });
});

describe('SEND_REPL_INPUT_TO_OUTPUT', () => {
  test('works correctly and pops replHistory when exceeding maxBrowseIndex', () => {
    const replHistory = {
      browseIndex: null,
      records: Array.from(Array(maxBrowseIndex), (x, index) => index + '') // Create an array with size maxBrowseIndex
    };

    const inputToOutputDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      replHistory
    });
    const newOutput = 'new-output-test';

    const actions: IAction[] = generateActions(SEND_REPL_INPUT_TO_OUTPUT, {
      type: 'code',
      value: newOutput
    });

    const newArray = [newOutput].concat(replHistory.records);
    newArray.pop();

    actions.forEach(action => {
      const result = reducer(inputToOutputDefaultState, action);
      const location = action.payload.workspaceLocation;
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
    const inputToOutputDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
      replHistory
    });
    const newOutput = '';

    const actions: IAction[] = generateActions(SEND_REPL_INPUT_TO_OUTPUT, {
      type: 'code',
      value: newOutput
    });

    actions.forEach(action => {
      const result = reducer(inputToOutputDefaultState, action);
      const location = action.payload.workspaceLocation;
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
          replHistory
        }
      });
    });
  });
});

describe('SET_EDITOR_SESSION_ID', () => {
  test('sets editorSessionId correctly', () => {
    const editorSessionId = 'test_editor_session_id';
    const actions: IAction[] = generateActions(SET_EDITOR_SESSION_ID, { editorSessionId });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
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

describe('SET_WEBSOCKET_STATUS', () => {
  test('sets websocketStatus correctly', () => {
    const websocketStatus = 1;
    const actions: IAction[] = generateActions(SET_WEBSOCKET_STATUS, { websocketStatus });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          websocketStatus: 1
        }
      });
    });
  });
});

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('toggles isEditorAutorun correctly', () => {
    const actions: IAction[] = generateActions(TOGGLE_EDITOR_AUTORUN);

    actions.forEach(action => {
      let result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          isEditorAutorun: true
        }
      });

      result = reducer(result, action);
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
    const assessmentAction: IAction = {
      type: UPDATE_CURRENT_ASSESSMENT_ID,
      payload: {
        assessmentId,
        questionId
      }
    };

    const result = reducer(defaultWorkspaceManager, assessmentAction);
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
    const assessmentAction: IAction = {
      type: UPDATE_CURRENT_SUBMISSION_ID,
      payload: {
        submissionId,
        questionId
      }
    };

    const result = reducer(defaultWorkspaceManager, assessmentAction);
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

describe('UPDATE_EDITOR_VALUE', () => {
  test('sets editorValue correctly', () => {
    const newEditorValue = 'test new editor value';
    const actions: IAction[] = generateActions(UPDATE_EDITOR_VALUE, { newEditorValue });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
      expect(result).toEqual({
        ...defaultWorkspaceManager,
        [location]: {
          ...defaultWorkspaceManager[location],
          editorValue: newEditorValue
        }
      });
    });
  });
});

describe('UPDATE_HAS_UNSAVED_CHANGES', () => {
  test('sets hasUnsavedChanges correctly', () => {
    const hasUnsavedChanges = true;
    const actions: IAction[] = generateActions(UPDATE_HAS_UNSAVED_CHANGES, { hasUnsavedChanges });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
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
    const actions: IAction[] = generateActions(UPDATE_REPL_VALUE, { newReplValue });

    actions.forEach(action => {
      const result = reducer(defaultWorkspaceManager, action);
      const location = action.payload.workspaceLocation;
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
