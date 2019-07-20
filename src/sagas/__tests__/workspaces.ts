import { Context, IOptions, Result, resume, runInContext } from 'js-slang';
import { InterruptedError } from 'js-slang/dist/interpreter-errors';
import { Finished, SourceError } from 'js-slang/dist/types';
import { cloneDeep } from 'lodash';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import {
  ExternalLibraryNames,
  ITestcase,
  Library
} from '../../components/assessment/assessmentShape';
import { mockRuntimeContext } from '../../mocks/context';
import { externalLibraries } from '../../reducers/externalLibraries';
import { defaultState, IState } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import workspaceSaga, { evalCode, evalTestCode } from '../workspaces';

function generateDefaultState(workspaceLocation: WorkspaceLocation, payload: any = {}): IState {
  return {
    ...defaultState,
    workspaces: {
      ...defaultState.workspaces,
      [workspaceLocation]: {
        ...defaultState.workspaces[workspaceLocation],
        ...payload
      }
    }
  };
}

beforeEach(() => {
  // Mock the inspector
  (window as any).Inspector = jest.fn();
  (window as any).Inspector.updateContext = jest.fn();
  (window as any).Inspector.highlightClean = jest.fn();
  (window as any).Inspector.highlightLine = jest.fn();
});

describe('EVAL_EDITOR', () => {
  test('puts beginInterruptExecution, beginClearContext, clearReplOutput and calls evalCode correctly', () => {
    const workspaceLocation = WorkspaceLocations.playground;
    const editorPrepend = 'prepend';
    const editorValue = 'value';
    const editorPostpend = 'postpend';
    const context = mockRuntimeContext();
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const code = editorPrepend + '\n' + editorValue + '\n' + editorPostpend;
    const library = {
      chapter: context.chapter,
      external: {
        name: ExternalLibraryNames.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorPrepend,
      editorPostpend,
      editorValue,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .put(actions.beginInterruptExecution(workspaceLocation))
        .put(actions.beginClearContext(library, workspaceLocation))
        .put(actions.clearReplOutput(workspaceLocation))
        // also calls evalCode here
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .dispatch({
          type: actionTypes.EVAL_EDITOR,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('calls showWarningMessage correctly when isEditorAutorun set to false', () => {
    const workspaceLocation = WorkspaceLocations.assessment;
    return expectSaga(workspaceSaga)
      .withState(defaultState)
      .call(showWarningMessage, 'Autorun Stopped', 750)
      .dispatch({
        type: actionTypes.TOGGLE_EDITOR_AUTORUN,
        payload: { workspaceLocation }
      })
      .silentRun();
  });

  test('calls showWarningMessage correctly when isEditorAutorun set to true', () => {
    const workspaceLocation = WorkspaceLocations.grading;
    const isEditorAutorun = true;
    const newDefaultState = generateDefaultState(workspaceLocation, { isEditorAutorun });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .call(showWarningMessage, 'Autorun Started', 750)
      .dispatch({
        type: actionTypes.TOGGLE_EDITOR_AUTORUN,
        payload: { workspaceLocation }
      })
      .silentRun();
  });
});

describe('INVALID_EDITOR_SESSION_ID', () => {
  test('calls showWarningMessage correctly', () => {
    return expectSaga(workspaceSaga)
      .call(showWarningMessage, 'Invalid ID Input', 1000)
      .dispatch({
        type: actionTypes.INVALID_EDITOR_SESSION_ID
      })
      .silentRun();
  });
});

describe('EVAL_REPL', () => {
  test('puts beginInterruptExecution, clearReplInput, sendReplInputToOutput and calls evalCode correctly', () => {
    const workspaceLocation = WorkspaceLocations.playground;
    const replValue = 'sample code';
    const newState = generateDefaultState(workspaceLocation, { replValue });
    const context = newState.workspaces[workspaceLocation].context;

    return (
      expectSaga(workspaceSaga)
        .withState(newState)
        .put(actions.beginInterruptExecution(workspaceLocation))
        .put(actions.clearReplInput(workspaceLocation))
        .put(actions.sendReplInputToOutput(replValue, workspaceLocation))
        // also calls evalCode here
        .call(runInContext, replValue, context, { scheduler: 'preemptive' })
        .dispatch({
          type: actionTypes.EVAL_REPL,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESUME', () => {
  let workspaceLocation: WorkspaceLocation;
  let editorValue: string;
  let context: Context;
  let state: IState;
  const status = { status: 'error' };

  beforeEach(() => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    workspaceLocation = WorkspaceLocations.playground;
    editorValue = 'sample code here';
    context = mockRuntimeContext();
    state = generateDefaultState(workspaceLocation);

    return expectSaga(evalCode, editorValue, context, workspaceLocation, actionTypes.EVAL_EDITOR)
      .withState(state)
      .silentRun();
  });

  test('puts beginInterruptExecution, clearReplOutput, highlightEditorLine and calls evalCode correctly', () => {
    const newDefaultState = generateDefaultState(workspaceLocation, { editorValue, context });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .provide({
          call(effect) {
            if (effect.fn === resume) {
              return { status: 'finished', value: 'abc' };
            } else {
              return;
            }
          }
        })
        .put(actions.beginInterruptExecution(workspaceLocation))
        .put(actions.clearReplOutput(workspaceLocation))
        .put(actions.highlightEditorLine([], workspaceLocation))
        // also calls evalCode here
        .call(resume, status)
        .dispatch({
          type: actionTypes.DEBUG_RESUME,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESET', () => {
  test('puts clearReplOutput correctly', () => {
    const workspaceLocation = WorkspaceLocations.assessment;
    const newDefaultState = generateDefaultState(workspaceLocation, { editorValue: 'test-value' });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(actions.clearReplOutput(workspaceLocation))
      .dispatch({
        type: actionTypes.DEBUG_RESET,
        payload: { workspaceLocation }
      })
      .silentRun()
      .then(result => {
        expect(result.storeState.workspaces[workspaceLocation].context.runtime.break).toBe(false);
      });
  });
});

describe('EVAL_TESTCASE', () => {
  test('puts beginInterruptExecution, beginClearContext and calls evalTestCode correctly', () => {
    const workspaceLocation = WorkspaceLocations.grading;
    const editorPrepend = 'prepend';
    const editorValue = 'value';
    const editorPostpend = 'postpend';
    const testcaseId = 0;
    const program = '123;';

    const editorTestcases: ITestcase[] = [
      {
        answer: '123',
        program,
        score: 1
      }
    ];

    const context = mockRuntimeContext();
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const code = editorPrepend + '\n' + editorValue + '\n' + editorPostpend + '\n' + program;
    const library = {
      chapter: context.chapter,
      external: {
        name: ExternalLibraryNames.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorPrepend,
      editorPostpend,
      editorValue,
      editorTestcases,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .put(actions.beginInterruptExecution(workspaceLocation))
        .put(actions.beginClearContext(library, workspaceLocation))
        // also calls evalTestCode here
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .dispatch({
          type: actionTypes.EVAL_TESTCASE,
          payload: { workspaceLocation, testcaseId }
        })
        .silentRun()
    );
  });
});

describe('CHAPTER_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = WorkspaceLocations.playground;
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    context = {
      ...mockRuntimeContext(),
      chapter: 4
    };
  });

  test('puts beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const newChapter = 3;
    const library: Library = {
      chapter: newChapter,
      external: {
        name: 'NONE',
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(actions.beginClearContext(library, workspaceLocation))
      .put(actions.clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
      .dispatch({
        type: actionTypes.CHAPTER_SELECT,
        payload: { chapter: newChapter, workspaceLocation }
      })
      .silentRun();
  });

  test('does not call beginClearContext, clearReplOutput and showSuccessMessage when oldChapter === newChapter', () => {
    const newChapter = 4;
    const library: Library = {
      chapter: newChapter,
      external: {
        name: 'NONE',
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put(actions.beginClearContext(library, workspaceLocation))
      .not.put(actions.clearReplOutput(workspaceLocation))
      .not.call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
      .dispatch({
        type: actionTypes.CHAPTER_SELECT,
        payload: { chapter: newChapter, workspaceLocation }
      })
      .silentRun();
  });
});

describe('PLAYGROUND_EXTERNAL_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let chapter: number;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = WorkspaceLocations.playground;
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    chapter = 4;
    context = {
      ...mockRuntimeContext(),
      chapter
    };
  });

  test('puts changePlaygroundExternal, beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const oldExternalLibraryName = ExternalLibraryNames.SOUNDS;
    const newExternalLibraryName = ExternalLibraryNames.RUNES;

    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      playgroundExternal: oldExternalLibraryName
    });

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(actions.changePlaygroundExternal(newExternalLibraryName))
      .put(actions.beginClearContext(library, workspaceLocation))
      .put(actions.clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000)
      .dispatch({
        type: actionTypes.PLAYGROUND_EXTERNAL_SELECT,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });

  test('does not call the above when oldExternalLibraryName === newExternalLibraryName', () => {
    const oldExternalLibraryName = ExternalLibraryNames.RUNES;
    const newExternalLibraryName = ExternalLibraryNames.RUNES;

    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      playgroundExternal: oldExternalLibraryName
    });

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put(actions.changePlaygroundExternal(newExternalLibraryName))
      .not.put(actions.beginClearContext(library, workspaceLocation))
      .not.put(actions.clearReplOutput(workspaceLocation))
      .not.call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000)
      .dispatch({
        type: actionTypes.PLAYGROUND_EXTERNAL_SELECT,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });
});

describe('ENSURE_LIBRARIES_LOADED', () => {
  test('does not call showWarningMessage when getReadyWebGLForCanvas is not undefined', () => {
    (window as any).getReadyWebGLForCanvas = jest.fn();

    return expectSaga(workspaceSaga)
      .not.call(showWarningMessage, 'Error loading libraries', 750)
      .dispatch({
        type: actionTypes.ENSURE_LIBRARIES_LOADED
      })
      .silentRun();
  });

  test('calls showWarningMessage when race condition timeouts', () => {
    return expectSaga(workspaceSaga)
      .provide({
        race: () => ({
          loadedScripts: undefined,
          timeout: true
        })
      })
      .call(showWarningMessage, 'Error loading libraries', 750)
      .dispatch({
        type: actionTypes.ENSURE_LIBRARIES_LOADED
      })
      .silentRun();
  });
});

describe('BEGIN_CLEAR_CONTEXT', () => {
  let loadLib: any;
  let getReadyWebGLForCanvas: any;
  let chapter: number;
  let globals: Array<[string, any]>;
  let workspaceLocation: WorkspaceLocation;

  beforeEach(() => {
    loadLib = jest.fn();
    getReadyWebGLForCanvas = jest.fn();

    (window as any).loadLib = loadLib;
    (window as any).getReadyWebGLForCanvas = getReadyWebGLForCanvas;

    workspaceLocation = WorkspaceLocations.grading;
    chapter = 4;
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
  });

  test('loads RUNES library correctly', () => {
    const newExternalLibraryName = ExternalLibraryNames.RUNES;

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .put(actions.endClearContext(library, workspaceLocation))
      .dispatch({
        type: actionTypes.BEGIN_CLEAR_CONTEXT,
        payload: { library, workspaceLocation }
      })
      .silentRun()
      .then(() => {
        expect(loadLib).toHaveBeenCalledWith('RUNES');
        expect(getReadyWebGLForCanvas).toHaveBeenCalledWith('3d');
        globals.forEach(item => {
          expect(window[item[0]]).toEqual(item[1]);
        });
      });
  });

  test('loads CURVES library correctly', () => {
    const newExternalLibraryName = ExternalLibraryNames.CURVES;

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .put(actions.endClearContext(library, workspaceLocation))
      .dispatch({
        type: actionTypes.BEGIN_CLEAR_CONTEXT,
        payload: { library, workspaceLocation }
      })
      .silentRun()
      .then(() => {
        expect(loadLib).toHaveBeenCalledWith('CURVES');
        expect(getReadyWebGLForCanvas).toHaveBeenCalledWith('curve');
        globals.forEach(item => {
          expect(window[item[0]]).toEqual(item[1]);
        });
      });
  });
});

describe('evalCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let actionType: string;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let lastDebuggerResult: Result;
  let state: IState;

  beforeEach(() => {
    workspaceLocation = WorkspaceLocations.assessment;
    code = 'sample code';
    actionType = actionTypes.EVAL_EDITOR;
    context = mockRuntimeContext();
    value = 'test value';
    options = { scheduler: 'preemptive' };
    lastDebuggerResult = { status: 'error' };
    state = generateDefaultState(workspaceLocation);
  });

  describe('on EVAL_EDITOR action without interruptions or pausing', () => {
    test('calls runInContext, puts evalInterpreterSuccess when runInContext returns finished', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put(actions.evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test('calls runInContext, puts endDebuggerPause and evalInterpreterSuccess when runInContext returns suspended', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'suspended' }]])
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put(actions.endDebuggerPause(workspaceLocation))
        .put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls runInContext, puts evalInterpreterError when runInContext returns error', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put.like({ action: { type: actionTypes.EVAL_INTERPRETER_ERROR } })
        .silentRun();
    });

    test('with error in the code, should return correct line number in error', () => {
      code = '// Prepend\n error';
      state = generateDefaultState(workspaceLocation, { editorPrepend: '// Prepend' });

      runInContext(code, context, { scheduler: 'preemptive' }).then(
        result => (context = (result as Finished).context)
      );

      const errors = context.errors.map((error: SourceError) => {
        const newError = cloneDeep(error);
        newError.location.start.line = newError.location.start.line - 1;
        newError.location.end.line = newError.location.end.line - 1;
        return newError;
      });

      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put(actions.evalInterpreterError(errors, workspaceLocation))
        .silentRun();
    });
  });

  describe('on DEBUG_RESUME action without interruptions or pausing', () => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    beforeEach(() => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionTypes.EVAL_EDITOR)
        .withState(state)
        .silentRun();
    });

    test('calls resume, puts evalInterpreterSuccess when resume returns finished', () => {
      actionType = actionTypes.DEBUG_RESUME;

      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'finished', value }]])
        .call(resume, lastDebuggerResult)
        .put(actions.evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts endDebuggerPause and evalInterpreterSuccess when resume returns suspended', () => {
      actionType = actionTypes.DEBUG_RESUME;

      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'suspended' }]])
        .call(resume, lastDebuggerResult)
        .put(actions.endDebuggerPause(workspaceLocation))
        .put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts evalInterpreterError when resume returns error', () => {
      actionType = actionTypes.DEBUG_RESUME;

      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .call(resume, lastDebuggerResult)
        .put.like({ action: { type: actionTypes.EVAL_INTERPRETER_ERROR } })
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts debuggerReset, endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: actionTypes.BEGIN_INTERRUPT_EXECUTION,
              payload: { workspaceLocation }
            }
          })
        })
        .put(actions.debuggerReset(workspaceLocation))
        .put(actions.endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, 'Execution aborted', 750)
        .silentRun()
        .then(result => {
          expect(context.errors[0]).toBeInstanceOf(InterruptedError);
        });
    });
  });

  describe('on paused', () => {
    test('puts endDebuggerPause and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .withState(state)
        .provide({
          race: () => ({
            paused: {
              type: actionTypes.BEGIN_DEBUG_PAUSE,
              payload: { workspaceLocation }
            }
          })
        })
        .put(actions.endDebuggerPause(workspaceLocation))
        .call(showWarningMessage, 'Execution paused', 750)
        .silentRun();
    });
  });
});

describe('evalTestCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let index: number;
  let state: IState;

  beforeEach(() => {
    workspaceLocation = WorkspaceLocations.assessment;
    code = 'more sample code';
    context = mockRuntimeContext();
    value = 'another test value';
    options = { scheduler: 'preemptive' };
    index = 1;
    state = generateDefaultState(workspaceLocation);
  });

  describe('without interrupt', () => {
    test('puts evalInterpreterSuccess and evalTestcaseSuccess on finished status', () => {
      return expectSaga(evalTestCode, code, context, workspaceLocation, index)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .put(actions.evalInterpreterSuccess(value, workspaceLocation))
        .put(actions.evalTestcaseSuccess(value, workspaceLocation, index))
        .silentRun();
    });

    test('puts evalInterpreterError and evalTestcaseFailure on other statuses', () => {
      return expectSaga(evalTestCode, code, context, workspaceLocation, index)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'error' }]])
        .put(actions.evalInterpreterError(context.errors, workspaceLocation))
        .put(actions.evalTestcaseFailure('An error occured', workspaceLocation, index))
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(evalTestCode, code, context, workspaceLocation, index)
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: actionTypes.BEGIN_INTERRUPT_EXECUTION,
              payload: { workspaceLocation }
            }
          })
        })
        .put(actions.endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, 'Execution aborted by user', 750)
        .silentRun()
        .then(() => {
          expect(context.errors[0]).toBeInstanceOf(InterruptedError);
        });
    });
  });
});
