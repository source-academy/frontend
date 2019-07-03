import { Context, IOptions, runInContext } from 'js-slang';
import { InterruptedError } from 'js-slang/dist/interpreter-errors';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import { Library } from '../../components/assessment/assessmentShape';
import { mockRuntimeContext } from '../../mocks/context';
import { defaultState, IState } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import workspaceSaga, { evalCode } from '../workspaces';

function generateDefaultState(workspaceLocation: WorkspaceLocations, payload: any = {}): IState {
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

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('calls showWarningMessage correctly when isEditorAutorun set to false', () => {
    return expectSaga(workspaceSaga)
      .withState(defaultState)
      .call(showWarningMessage, 'Autorun Stopped', 750)
      .dispatch({
        type: actionTypes.TOGGLE_EDITOR_AUTORUN,
        payload: { workspaceLocation: WorkspaceLocations.assessment }
      })
      .silentRun();
  });

  test('calls showWarningMessage correctly when isEditorAutorun set to true', () => {
    const workspaceLocation = WorkspaceLocations.grading;
    const newDefaultState = generateDefaultState(workspaceLocation, { isEditorAutorun: true });

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
  test('calls beginInterruptExecution, clearReplInput and sendReplInputToOutput correctly', () => {
    const workspaceLocation = WorkspaceLocations.playground;
    const replValue = 'sample code';
    const newState = generateDefaultState(workspaceLocation, { replValue });

    return (
      expectSaga(workspaceSaga)
        .withState(newState)
        .put(actions.beginInterruptExecution(workspaceLocation))
        .put(actions.clearReplInput(workspaceLocation))
        .put(actions.sendReplInputToOutput(replValue, workspaceLocation))
        // also calls evalCode here
        .dispatch({
          type: actionTypes.EVAL_REPL,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESET', () => {
  test('calls setBreakpointAtLine correctly', () => {
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
        // check final state
        expect(result.storeState.workspaces[workspaceLocation].context.runtime.break).toBe(false);
      });
  });
});

describe('CHAPTER_SELECT', () => {
  test('puts beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const workspaceLocation = WorkspaceLocations.playground;
    const newChapter = 3;

    const context = {
      chapter: 4,
      externalSymbols: ['abc', 'def']
    };
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
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
});

describe('EVAL_CODE', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let actionType: string;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;

  beforeEach(() => {
    workspaceLocation = WorkspaceLocations.assessment;
    code = 'sample code';
    actionType = actionTypes.EVAL_EDITOR;
    context = mockRuntimeContext();
    value = 'test value';
    options = { scheduler: 'preemptive' };
  });

  describe('without interruptions or pausing', () => {
    test('calls runInContext, puts evalInterpreterSuccess with EVAL_EDITOR action when runInContext returns finished', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put(actions.evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test(
      'calls runInContext, puts endDebuggerPause and evalInterpreterSuccess with EVAL_EDITOR action when ' +
        'runInContext returns suspended',
      () => {
        return expectSaga(evalCode, code, context, workspaceLocation, actionType)
          .provide([[call(runInContext, code, context, options), { status: 'suspended' }]])
          .call(runInContext, code, context, { scheduler: 'preemptive' })
          .put(actions.endDebuggerPause(workspaceLocation))
          .put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
          .silentRun();
      }
    );

    test('calls runInContext and puts evalInterpreterError, with EVAL_EDITOR action when runInContext returns error', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
        .call(runInContext, code, context, { scheduler: 'preemptive' })
        .put.like({ action: { type: actionTypes.EVAL_INTERPRETER_ERROR } })
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts debuggerReset, endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
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
          // check final state
          expect(context.errors[0]).toBeInstanceOf(InterruptedError);
        });
    });
  });

  describe('on paused', () => {
    test('puts endDebuggerPause and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, workspaceLocation, actionType)
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
