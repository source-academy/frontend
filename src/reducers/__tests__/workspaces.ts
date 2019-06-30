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
  EVAL_TESTCASE,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS,
  HANDLE_CONSOLE_LOG,
  HIGHLIGHT_LINE,
  IAction,
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

test('BROWSE_REPL_HISTORY_DOWN works on non-null browseIndex and returns replValue to last value on no further records', () => {
  const originalReplValue = 'browsing history';
  const records = ['first history', 'second history'];

  const replHistory = {
    browseIndex: 1,
    records,
    originalReplValue
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
        replValue: originalReplValue,
        replHistory: {
          browseIndex: null,
          records,
          originalReplValue: ''
        }
      }
    });
  });
});

test('BROWSE_REPL_HISTORY_DOWN returns unchanged state on null browseIndex', () => {
  const originalReplValue = 'history';
  const records = ['first history', 'second history'];
  const replHistory = {
    browseIndex: null,
    records,
    originalReplValue
  };

  const replDownDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ replHistory });
  const actions: IAction[] = generateActions(BROWSE_REPL_HISTORY_DOWN, { replHistory });

  actions.forEach(action => {
    const result = reducer(replDownDefaultState, action);
    expect(result).toEqual(replDownDefaultState);
  });
});

test('BROWSE_REPL_HISTORY_UP works correctly on non-null browseIndex and returns unchanged state when there is no more history', () => {
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
          originalReplValue: replValue
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
          originalReplValue: replValue
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
          originalReplValue: replValue
        }
      }
    });
  });
});

test('CHANGE_ACTIVE_TAB works correctly', () => {
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

test('CHANGE_EDITOR_HEIGHT works correctly', () => {
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

test('CHANGE_EDITOR_WIDTH works correctly', () => {
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

test('CHANGE_PLAYGROUND_EXTERNAL works correctly', () => {
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

test('CHANGE_SIDE_CONTENT_HEIGHT works correctly', () => {
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

test('CLEAR_REPL_INPUT clears replValue correctly', () => {
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

test('CLEAR_REPL_OUTPUT clears replValue correctly', () => {
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

test('DEBUG_RESET works correctly', () => {
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

test('DEBUG_RESUME works correctly', () => {
  const isDebugging = true;
  const debugResumeDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ isDebugging });
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

test('END_CLEAR_CONTEXT works correctly', () => {
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
      name: 'STREAMS',
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

test('END_DEBUG_PAUSE works correctly', () => {
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

test('END_INTERRUPT_EXECUTION works correctly', () => {
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

test('EVAL_EDITOR works correctly', () => {
  const isDebugging = true;
  const evalEditorDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({ isDebugging });
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

test('EVAL_INTERPRETER_ERROR works correctly with RunningOutput', () => {
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

test('EVAL_INTERPRETER_ERROR works correctly with other outputs', () => {
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

test('EVAL_INTERPRETER_SUCCESS works correctly with RunningOutput', () => {
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

test('EVAL_INTERPRETER_SUCCESS works correctly with other outputs', () => {
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

test('EVAL_REPL works correctly', () => {
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

// Test data for EVAL_TESTCASE, EVAL_TESTCASE_FAILURE, EVAL_TESTCASE_SUCCESS
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

test('EVAL_TESTCASE works correctly', () => {
  const evalTestcaseDefaultState: IWorkspaceManagerState = generateDefaultWorkspace({
    editorTestcases
  });
  const actions: IAction[] = generateActions(EVAL_TESTCASE, { testcaseId: 1 });

  actions.forEach(action => {
    const result = reducer(evalTestcaseDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...evalTestcaseDefaultState,
      [location]: {
        ...evalTestcaseDefaultState[location],
        isRunning: true,
        editorTestcases: [
          {
            ...editorTestcases[0]
          },
          {
            ...editorTestcases[1],
            result: undefined
          }
        ]
      }
    });
  });
});

test('EVAL_TESTCASE_FAILURE works correctly', () => {
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

test('EVAL_TESTCASE_SUCCESS works correctly on RunningOutput and CodeOutput', () => {
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

test('EVAL_TESTCASE_SUCCESS works correctly on other output', () => {
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

test('HANDLE_CONSOLE_LOG works correctly with RunningOutput', () => {
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

test('HANDLE_CONSOLE_LOG works correctly with other output', () => {
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

test('HANDLE_CONSOLE_LOG works correctly with empty output', () => {
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

test('HIGHLIGHT_LINE works correctly', () => {
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

test('LOG_OUT preserves playground workspace even after logout', () => {
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

test('RESET_WORKSPACE works correctly', () => {
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

test('SEND_REPL_INPUT_TO_OUTPUT works correctly and pops replHistory when exceeding maxBrowseIndex', () => {
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

test('SEND_REPL_INPUT_TO_OUTPUT works correctly with empty newOutput value', () => {
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

test('SET_EDITOR_SESSION_ID works correctly', () => {
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

test('SET_WEBSOCKET_STATUS works correctly', () => {
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

test('TOGGLE_EDITOR_AUTORUN works correctly', () => {
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

test('UPDATE_CURRENT_ASSESSMENT_ID works correctly', () => {
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

test('UPDATE_CURRENT_SUBMISSION_ID works correctly', () => {
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

test('UPDATE_EDITOR_VALUE works correctly', () => {
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

test('UPDATE_HAS_UNSAVED_CHANGES works correctly', () => {
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

test('UPDATE_REPL_VALUE works correctly', () => {
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
