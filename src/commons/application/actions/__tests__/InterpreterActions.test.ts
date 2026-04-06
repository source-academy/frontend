import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import InterpreterActions from '../InterpreterActions';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

test('handleConsoleLog generates correct action object', () => {
  const logString = 'test-log-string';
  const action = InterpreterActions.handleConsoleLog(assessmentWorkspace, logString);
  expect(action).toEqual({
    type: InterpreterActions.handleConsoleLog.type,
    payload: {
      logString: [logString],
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalInterpreterSuccess generates correct action object', () => {
  const value = 'value';
  const action = InterpreterActions.evalInterpreterSuccess(value, gradingWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.evalInterpreterSuccess.type,
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
  const action = InterpreterActions.evalTestcaseSuccess(value, playgroundWorkspace, index);
  expect(action).toEqual({
    type: InterpreterActions.evalTestcaseSuccess.type,
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
  const action = InterpreterActions.evalInterpreterError(errors, assessmentWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.evalInterpreterError.type,
    payload: {
      type: 'errors',
      errors,
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('beginInterruptExecution generates correct action object', () => {
  const action = InterpreterActions.beginInterruptExecution(gradingWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.beginInterruptExecution.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('endInterruptExecution generates correct action object', () => {
  const action = InterpreterActions.endInterruptExecution(playgroundWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.endInterruptExecution.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('beginDebuggerPause generates correct action object', () => {
  const action = InterpreterActions.beginDebuggerPause(assessmentWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.beginDebuggerPause.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('endDebuggerPause generates correct action object', () => {
  const action = InterpreterActions.endDebuggerPause(gradingWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.endDebuggerPause.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('debuggerResume generates correct action object', () => {
  const action = InterpreterActions.debuggerResume(playgroundWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.debuggerResume.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('debuggerReset generates correct action object', () => {
  const action = InterpreterActions.debuggerReset(assessmentWorkspace);
  expect(action).toEqual({
    type: InterpreterActions.debuggerReset.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});
