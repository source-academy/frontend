import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  END_DEBUG_PAUSE,
  END_INTERRUPT_EXECUTION,
  EVAL_INTERPRETER_ERROR,
  EVAL_INTERPRETER_SUCCESS,
  EVAL_TESTCASE_SUCCESS,
  HANDLE_CONSOLE_LOG
} from '../../types/InterpreterTypes';
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
} from '../InterpreterActions';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

test('handleConsoleLog generates correct action object', () => {
  const logString = 'test-log-string';
  const action = handleConsoleLog(assessmentWorkspace, logString);
  expect(action).toEqual({
    type: HANDLE_CONSOLE_LOG,
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
    type: EVAL_INTERPRETER_SUCCESS,
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
    type: EVAL_TESTCASE_SUCCESS,
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
    type: EVAL_INTERPRETER_ERROR,
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
    type: BEGIN_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('endInterruptExecution generates correct action object', () => {
  const action = endInterruptExecution(playgroundWorkspace);
  expect(action).toEqual({
    type: END_INTERRUPT_EXECUTION,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('beginDebuggerPause generates correct action object', () => {
  const action = beginDebuggerPause(assessmentWorkspace);
  expect(action).toEqual({
    type: BEGIN_DEBUG_PAUSE,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('endDebuggerPause generates correct action object', () => {
  const action = endDebuggerPause(gradingWorkspace);
  expect(action).toEqual({
    type: END_DEBUG_PAUSE,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('debuggerResume generates correct action object', () => {
  const action = debuggerResume(playgroundWorkspace);
  expect(action).toEqual({
    type: DEBUG_RESUME,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('debuggerReset generates correct action object', () => {
  const action = debuggerReset(assessmentWorkspace);
  expect(action).toEqual({
    type: DEBUG_RESET,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});
