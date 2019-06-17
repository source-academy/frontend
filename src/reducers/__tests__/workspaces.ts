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

test('BROWSE_REPL_HISTORY_DOWN works on non-null browseIndex and returns replValue to last value on no further records', () => {
  const browsingHistory = 'browsing history'; // last value before browsing
  const replHistoryWithoutRecords = ['first history', 'second history'];
  const replHistoryWithRecords = replHistoryWithoutRecords.slice(0);
  replHistoryWithRecords[-1] = browsingHistory;

  const replHistory = {
    browseIndex: 1,
    records: replHistoryWithRecords
  };

  const replDownDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replHistory
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replHistory
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replHistory
    }
  };

  const assessmentAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
        replValue: browsingHistory,
        replHistory: {
          browseIndex: null,
          records: replHistoryWithoutRecords
        }
      }
    });
  });
});

test('BROWSE_REPL_HISTORY_DOWN returns unchanged state on null browseIndex', () => {
  const records = ['first history', 'second history'];
  const replHistory = {
    browseIndex: null,
    records
  };

  const replDownDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replHistory
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replHistory
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replHistory
    }
  };

  const assessmentAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: {
      replHistory,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    const result = reducer(replDownDefaultState, action);
    expect(result).toEqual(replDownDefaultState);
  });
});

test('BROWSE_REPL_HISTORY_UP works correctly on non-null browseIndex and returns unchanged state when there is no more history', () => {
  const replValue = 'repl history';
  const replHistoryWithoutRecords = ['first history', 'second history'];
  const replHistoryWithRecords = replHistoryWithoutRecords.slice(0);
  replHistoryWithRecords[-1] = replValue;

  const replHistory = {
    browseIndex: null,
    records: replHistoryWithoutRecords
  };

  const replUpDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replHistory,
      replValue
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replHistory,
      replValue
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replHistory,
      replValue
    }
  };

  const assessmentAction: IAction = {
    type: BROWSE_REPL_HISTORY_UP,
    payload: {
      replHistory,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: BROWSE_REPL_HISTORY_UP,
    payload: {
      replHistory,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: BROWSE_REPL_HISTORY_UP,
    payload: {
      replHistory,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    let result = reducer(replUpDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...replUpDefaultState,
      [location]: {
        ...replUpDefaultState[location],
        replValue: replHistory.records[0],
        replHistory: {
          records: replHistoryWithRecords,
          browseIndex: 0
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
          records: replHistoryWithRecords,
          browseIndex: 1
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
          records: replHistoryWithRecords,
          browseIndex: 1
        }
      }
    });
  });
});

test('CHANGE_ACTIVE_TAB works correctly', () => {
  const activeTab = 2;
  const assessmentAction: IAction = {
    type: CHANGE_ACTIVE_TAB,
    payload: {
      activeTab,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CHANGE_ACTIVE_TAB,
    payload: {
      activeTab,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CHANGE_ACTIVE_TAB,
    payload: {
      activeTab,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: CHANGE_EDITOR_HEIGHT,
    payload: {
      height,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CHANGE_EDITOR_HEIGHT,
    payload: {
      height,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CHANGE_EDITOR_HEIGHT,
    payload: {
      height,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: CHANGE_EDITOR_WIDTH,
    payload: {
      widthChange,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CHANGE_EDITOR_WIDTH,
    payload: {
      widthChange,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CHANGE_EDITOR_WIDTH,
    payload: {
      widthChange,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: CHANGE_SIDE_CONTENT_HEIGHT,
    payload: {
      height,
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CHANGE_SIDE_CONTENT_HEIGHT,
    payload: {
      height,
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CHANGE_SIDE_CONTENT_HEIGHT,
    payload: {
      height,
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const clearReplDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replValue
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replValue
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replValue
    }
  };

  const assessmentAction: IAction = {
    type: CLEAR_REPL_INPUT,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CLEAR_REPL_INPUT,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CLEAR_REPL_INPUT,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const clearReplDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output
    }
  };

  const assessmentAction: IAction = {
    type: CLEAR_REPL_OUTPUT,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: CLEAR_REPL_OUTPUT,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: CLEAR_REPL_OUTPUT,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const debugResetDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      isRunning: true,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      isRunning: true,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      isRunning: true,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: DEBUG_RESET,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: DEBUG_RESET,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: DEBUG_RESET,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const debugResumeDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: DEBUG_RESUME,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: DEBUG_RESUME,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: DEBUG_RESUME,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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

  const assessmentAction: IAction = {
    type: END_CLEAR_CONTEXT,
    payload: {
      workspaceLocation: assessmentWorkspace,
      library
    }
  };
  const gradingAction: IAction = {
    type: END_CLEAR_CONTEXT,
    payload: {
      workspaceLocation: gradingWorkspace,
      library
    }
  };
  const playgroundAction: IAction = {
    type: END_CLEAR_CONTEXT,
    payload: {
      workspaceLocation: playgroundWorkspace,
      library
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const debugPauseDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      isRunning: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      isRunning: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      isRunning: true
    }
  };

  const assessmentAction: IAction = {
    type: END_DEBUG_PAUSE,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: END_DEBUG_PAUSE,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: END_DEBUG_PAUSE,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const interruptExecutionDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      isRunning: true,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      isRunning: true,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      isRunning: true,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: END_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: END_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: END_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const evalEditorDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_EDITOR,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_EDITOR,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_EDITOR,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
const lastOutput1: RunningOutput[] = [
  {
    type: 'running',
    consoleLogs: ['console-log-test']
  },
  {
    type: 'running',
    consoleLogs: ['console-log-test-2']
  }
];

const lastOutput2: InterpreterOutput[] = [
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
  const evalEditorDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput1,
      isRunning: true,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput1,
      isRunning: true,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput1,
      isRunning: true,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
            ...lastOutput1[0]
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
  const evalEditorDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput2,
      isRunning: true,
      isDebugging: true
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput2,
      isRunning: true,
      isDebugging: true
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput2,
      isRunning: true,
      isDebugging: true
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_INTERPRETER_ERROR,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
            ...lastOutput2[0]
          },
          {
            ...lastOutput2[1]
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
  const evalEditorDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput1,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput1,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput1,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
            ...lastOutput1[0]
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
  const evalEditorDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput2,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput2,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput2,
      isRunning: true,
      breakpoints: ['1', '2'],
      highlightedLines: [[3], [5]]
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_INTERPRETER_SUCCESS,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
            ...lastOutput2[0]
          },
          {
            ...lastOutput2[1]
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
  const assessmentAction: IAction = {
    type: EVAL_REPL,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_REPL,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_REPL,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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

test('EVAL_TESTCASE works correctly', () => {
  const assessmentAction: IAction = {
    type: EVAL_TESTCASE,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: EVAL_TESTCASE,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_TESTCASE,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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

// Test data for EVAL_TESTCASE_SUCCESS
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

test('EVAL_TESTCASE_SUCCESS works correctly on RunningOutput', () => {
  const testcaseSuccessDefaultState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput1,
      isRunning: true,
      editorTestcases
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput1,
      isRunning: true,
      editorTestcases
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput1,
      isRunning: true,
      editorTestcases
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: assessmentWorkspace,
      index: 1
    }
  };
  const gradingAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: gradingWorkspace,
      index: 1
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: playgroundWorkspace,
      index: 1
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    const result = reducer(testcaseSuccessDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...testcaseSuccessDefaultState,
      [location]: {
        ...testcaseSuccessDefaultState[location],
        isRunning: false,
        output: lastOutput1,
        editorTestcases: [
          {
            ...editorTestcases[0]
          },
          {
            ...editorTestcases[1],
            actual: {
              ...lastOutput1[0]
            }
          }
        ]
      }
    });
  });
});

test('EVAL_TESTCASE_SUCCESS works correctly on other output', () => {
  const testcaseSuccessDefaultState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput2,
      isRunning: true,
      editorTestcases
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput2,
      isRunning: true,
      editorTestcases
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput2,
      isRunning: true,
      editorTestcases
    }
  };

  const assessmentAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: assessmentWorkspace,
      index: 0
    }
  };
  const gradingAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: gradingWorkspace,
      index: 0
    }
  };
  const playgroundAction: IAction = {
    type: EVAL_TESTCASE_SUCCESS,
    payload: {
      workspaceLocation: playgroundWorkspace,
      index: 0
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    const result = reducer(testcaseSuccessDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...testcaseSuccessDefaultState,
      [location]: {
        ...testcaseSuccessDefaultState[location],
        isRunning: false,
        output: lastOutput2,
        editorTestcases: [
          {
            ...editorTestcases[0],
            actual: {
              ...lastOutput2[0]
            }
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
  const consoleLogDefaultState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput1
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput1
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput1
    }
  };

  const assessmentAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: assessmentWorkspace,
      logString
    }
  };
  const gradingAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: gradingWorkspace,
      logString
    }
  };
  const playgroundAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: playgroundWorkspace,
      logString
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    const result = reducer(consoleLogDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...consoleLogDefaultState,
      [location]: {
        ...consoleLogDefaultState[location],
        output: [
          {
            ...lastOutput1[0]
          },
          {
            ...lastOutput1[1],
            consoleLogs: lastOutput1[1].consoleLogs.concat(logString)
          }
        ]
      }
    });
  });
});

test('HANDLE_CONSOLE_LOG works correctly with other output', () => {
  const logString = 'test-log-string-2';
  const consoleLogDefaultState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: lastOutput2
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: lastOutput2
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: lastOutput2
    }
  };

  const assessmentAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: assessmentWorkspace,
      logString
    }
  };
  const gradingAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: gradingWorkspace,
      logString
    }
  };
  const playgroundAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: playgroundWorkspace,
      logString
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

  actions.forEach(action => {
    const result = reducer(consoleLogDefaultState, action);
    const location = action.payload.workspaceLocation;
    expect(result).toEqual({
      ...consoleLogDefaultState,
      [location]: {
        ...consoleLogDefaultState[location],
        output: lastOutput2.concat({
          type: 'running',
          consoleLogs: [logString]
        })
      }
    });
  });
});

test('HANDLE_CONSOLE_LOG works correctly with empty output', () => {
  const logString = 'test-log-string-3';
  const consoleLogDefaultState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      output: []
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      output: []
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      output: []
    }
  };

  const assessmentAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: assessmentWorkspace,
      logString
    }
  };
  const gradingAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: gradingWorkspace,
      logString
    }
  };
  const playgroundAction: IAction = {
    type: HANDLE_CONSOLE_LOG,
    payload: {
      workspaceLocation: playgroundWorkspace,
      logString
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: HIGHLIGHT_LINE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      highlightedLines
    }
  };
  const gradingAction: IAction = {
    type: HIGHLIGHT_LINE,
    payload: {
      workspaceLocation: gradingWorkspace,
      highlightedLines
    }
  };
  const playgroundAction: IAction = {
    type: HIGHLIGHT_LINE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      highlightedLines
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const resetWorkspaceDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      editorHeight: 200,
      editorWidth: '70%'
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      editorHeight: 200,
      editorWidth: '70%'
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      editorHeight: 200,
      editorWidth: '70%'
    }
  };
  const workspaceOptions = {
    breakpoints: ['1', '3'],
    highlightedLines: [[1], [10]],
    replValue: 'test repl value'
  };
  const assessmentAction: IAction = {
    type: RESET_WORKSPACE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      workspaceOptions
    }
  };
  const gradingAction: IAction = {
    type: RESET_WORKSPACE,
    payload: {
      workspaceLocation: gradingWorkspace,
      workspaceOptions
    }
  };
  const playgroundAction: IAction = {
    type: RESET_WORKSPACE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      workspaceOptions
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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

  const inputToOutputDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replHistory
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replHistory
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replHistory
    }
  };
  const newOutput = 'new-output-test';

  const assessmentAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: assessmentWorkspace,
      value: newOutput
    }
  };
  const gradingAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: gradingWorkspace,
      value: newOutput
    }
  };
  const playgroundAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: playgroundWorkspace,
      value: newOutput
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];
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
  const inputToOutputDefaultState: IWorkspaceManagerState = {
    assessment: {
      ...defaultWorkspaceManager.assessment,
      replHistory
    },
    grading: {
      ...defaultWorkspaceManager.grading,
      replHistory
    },
    playground: {
      ...defaultWorkspaceManager.playground,
      replHistory
    }
  };
  const newOutput = '';
  const assessmentAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: assessmentWorkspace,
      value: newOutput
    }
  };
  const gradingAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: gradingWorkspace,
      value: newOutput
    }
  };
  const playgroundAction: IAction = {
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      workspaceLocation: playgroundWorkspace,
      value: newOutput
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: SET_EDITOR_SESSION_ID,
    payload: {
      editorSessionId
    }
  };
  const gradingAction: IAction = {
    type: SET_EDITOR_SESSION_ID,
    payload: {
      editorSessionId
    }
  };
  const playgroundAction: IAction = {
    type: SET_EDITOR_SESSION_ID,
    payload: {
      editorSessionId
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: SET_WEBSOCKET_STATUS,
    payload: {
      workspaceLocation: assessmentWorkspace,
      websocketStatus: 1
    }
  };
  const gradingAction: IAction = {
    type: SET_WEBSOCKET_STATUS,
    payload: {
      workspaceLocation: gradingWorkspace,
      websocketStatus: 1
    }
  };
  const playgroundAction: IAction = {
    type: SET_WEBSOCKET_STATUS,
    payload: {
      workspaceLocation: playgroundWorkspace,
      websocketStatus: 1
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: TOGGLE_EDITOR_AUTORUN,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  };
  const gradingAction: IAction = {
    type: TOGGLE_EDITOR_AUTORUN,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  };
  const playgroundAction: IAction = {
    type: TOGGLE_EDITOR_AUTORUN,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: UPDATE_EDITOR_VALUE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      newEditorValue
    }
  };
  const gradingAction: IAction = {
    type: UPDATE_EDITOR_VALUE,
    payload: {
      workspaceLocation: gradingWorkspace,
      newEditorValue
    }
  };
  const playgroundAction: IAction = {
    type: UPDATE_EDITOR_VALUE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      newEditorValue
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: UPDATE_HAS_UNSAVED_CHANGES,
    payload: {
      workspaceLocation: assessmentWorkspace,
      hasUnsavedChanges: true
    }
  };
  const gradingAction: IAction = {
    type: UPDATE_HAS_UNSAVED_CHANGES,
    payload: {
      workspaceLocation: gradingWorkspace,
      hasUnsavedChanges: true
    }
  };
  const playgroundAction: IAction = {
    type: UPDATE_HAS_UNSAVED_CHANGES,
    payload: {
      workspaceLocation: playgroundWorkspace,
      hasUnsavedChanges: true
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
  const assessmentAction: IAction = {
    type: UPDATE_REPL_VALUE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      newReplValue
    }
  };
  const gradingAction: IAction = {
    type: UPDATE_REPL_VALUE,
    payload: {
      workspaceLocation: gradingWorkspace,
      newReplValue
    }
  };
  const playgroundAction: IAction = {
    type: UPDATE_REPL_VALUE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      newReplValue
    }
  };

  const actions: IAction[] = [assessmentAction, gradingAction, playgroundAction];

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
