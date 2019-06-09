import {
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_ACTIVE_TAB,
  CHANGE_EDITOR_HEIGHT,
  //   CHANGE_EDITOR_WIDTH,
  //   CHANGE_PLAYGROUND_EXTERNAL,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CLEAR_REPL_INPUT,
  //   CLEAR_REPL_OUTPUT,
  DEBUG_RESET,
  DEBUG_RESUME,
  //   END_CLEAR_CONTEXT,
  END_DEBUG_PAUSE,
  END_INTERRUPT_EXECUTION,
  EVAL_EDITOR,
  //   EVAL_INTERPRETER_ERROR,
  //   EVAL_INTERPRETER_SUCCESS,
  EVAL_REPL,
  EVAL_TESTCASE,
  //   EVAL_TESTCASE_SUCCESS,
  //   HANDLE_CONSOLE_LOG,
  //   HIGHLIGHT_LINE,
  IAction,
  //   LOG_OUT,
  //   RESET_WORKSPACE,
  //   SEND_REPL_INPUT_TO_OUTPUT,
  //   SET_EDITOR_SESSION_ID,
  //   SET_WEBSOCKET_STATUS,
  TOGGLE_EDITOR_AUTORUN,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE
} from '../../actions/actionTypes';
import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import { defaultWorkspaceManager, IWorkspaceManagerState } from '../states';
import { reducer } from '../workspaces';

let assessmentWorkspace: WorkspaceLocation,
  gradingWorkspace: WorkspaceLocation,
  playgroundWorkspace: WorkspaceLocation;

beforeEach(() => {
  assessmentWorkspace = WorkspaceLocations.assessment;
  gradingWorkspace = WorkspaceLocations.grading;
  playgroundWorkspace = WorkspaceLocations.playground;
});

test('BROWSE_REPL_HISTORY_DOWN works on non-null browseIndex and returns replValue to last value on no further records', () => {
  const browsingHistory = 'browsing history'; // last value before browsing
  const replHistoryWithoutRecords = ['first history', 'second history'];
  let replHistoryWithRecords = replHistoryWithoutRecords.slice(0);
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
  const browsingHistory = 'browsing history';
  let records = ['first history', 'second history'];
  records[-1] = browsingHistory;

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

test('BROWSE_REPL_HISTORY_UP works correctly on non-null browseIndex and does nothing when there is no more history', () => {
  const replValue = 'repl history';
  const replHistoryWithoutRecords = ['first history', 'second history'];
  let replHistoryWithRecords = replHistoryWithoutRecords.slice(0);
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

  let result = reducer(defaultWorkspaceManager, assessmentAction);
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

  let result = reducer(defaultWorkspaceManager, assessmentAction);
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
