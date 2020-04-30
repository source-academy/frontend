import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import * as actionTypes from '../actionTypes';
import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume,
  endDebuggerPause,
  endInterruptExecution,
  evalInterpreterError,
  evalInterpreterSuccess,
  evalTestcaseSuccess,
  handleConsoleLog
} from '../interpreter';

const assessmentWorkspace: WorkspaceLocation = WorkspaceLocations.assessment;
const gradingWorkspace: WorkspaceLocation = WorkspaceLocations.grading;
const playgroundWorkspace: WorkspaceLocation = WorkspaceLocations.playground;

test('handleConsoleLog generates correct action object', () => {
  const logString = 'test-log-string';
  const action = handleConsoleLog(logString, assessmentWorkspace);
  expect(action).toEqual({
    type: actionTypes.HANDLE_CONSOLE_LOG,
    payload: {
      logString,
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalInterpreterSuccess generates correct action object', () => {
  const value = 'value';
  const action = evalInterpreterSuccess(value, gradingWorkspace);
  expect(action).toEqual({
    type: actionTypes.EVAL_INTERPRETER_SUCCESS,
    payload: {
      type: 'result',
      value,
      workspaceLocation: gradingWorkspace
    }
  });
});

test('evalTestcaseSuccess generates correct action object', () => {
  const value = 'another value';
  const index = 3;
  const action = evalTestcaseSuccess(value, playgroundWorkspace, index);
  expect(action).toEqual({
    type: actionTypes.EVAL_TESTCASE_SUCCESS,
    payload: {
      type: 'result',
      value,
      workspaceLocation: playgroundWorkspace,
      index
    }
  });
});

test('evalInterpreterError generates correct action object', () => {
  const errors: any = [];
  const action = evalInterpreterError(errors, assessmentWorkspace);
  expect(action).toEqual({
    type: actionTypes.EVAL_INTERPRETER_ERROR,
    payload: {
      type: 'errors',
      errors,
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('beginInterruptExecution generates correct action object', () => {
  const action = beginInterruptExecution(gradingWorkspace);
  expect(action).toEqual({
    type: actionTypes.BEGIN_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('endInterruptExecution generates correct action object', () => {
  const action = endInterruptExecution(playgroundWorkspace);
  expect(action).toEqual({
    type: actionTypes.END_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('beginDebuggerPause generates correct action object', () => {
  const action = beginDebuggerPause(assessmentWorkspace);
  expect(action).toEqual({
    type: actionTypes.BEGIN_DEBUG_PAUSE,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('endDebuggerPause generates correct action object', () => {
  const action = endDebuggerPause(gradingWorkspace);
  expect(action).toEqual({
    type: actionTypes.END_DEBUG_PAUSE,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('debuggerResume generates correct action object', () => {
  const action = debuggerResume(playgroundWorkspace);
  expect(action).toEqual({
    type: actionTypes.DEBUG_RESUME,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('debuggerReset generates correct action object', () => {
  const action = debuggerReset(assessmentWorkspace);
  expect(action).toEqual({
    type: actionTypes.DEBUG_RESET,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});
