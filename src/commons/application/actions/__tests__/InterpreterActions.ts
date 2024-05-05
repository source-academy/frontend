import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
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
    type: handleConsoleLog.type,
    payload: {
      logString: [logString],
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalInterpreterSuccess generates correct action object', () => {
  const value = 'value';
  const action = evalInterpreterSuccess(value, gradingWorkspace);
  expect(action).toEqual({
    type: evalInterpreterSuccess.type,
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
    type: evalTestcaseSuccess.type,
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
    type: evalInterpreterError.type,
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
    type: beginInterruptExecution.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('endInterruptExecution generates correct action object', () => {
  const action = endInterruptExecution(playgroundWorkspace);
  expect(action).toEqual({
    type: endInterruptExecution.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('beginDebuggerPause generates correct action object', () => {
  const action = beginDebuggerPause(assessmentWorkspace);
  expect(action).toEqual({
    type: beginDebuggerPause.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('endDebuggerPause generates correct action object', () => {
  const action = endDebuggerPause(gradingWorkspace);
  expect(action).toEqual({
    type: endDebuggerPause.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('debuggerResume generates correct action object', () => {
  const action = debuggerResume(playgroundWorkspace);
  expect(action).toEqual({
    type: debuggerResume.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('debuggerReset generates correct action object', () => {
  const action = debuggerReset(assessmentWorkspace);
  expect(action).toEqual({
    type: debuggerReset.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});
