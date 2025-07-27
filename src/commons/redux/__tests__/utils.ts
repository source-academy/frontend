import { testSaga } from 'redux-saga-test-plan';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { vi } from 'vitest';

import { combineSagaHandlers, createActions } from '../utils';

// Would have used spyOn, but for some reason that doesn't work properly
vi.mock('src/commons/sagas/SafeEffects', () => ({
  // Mock wrap saga to just be a passthrough so that the identity
  // checking that testSaga uses will pass
  wrapSaga: (x: any) => x
}));

test('test combineSagaHandlers', () => {
  const mockTakeEveryHandler = vi.fn();
  const mockTakeLatestHandler = vi.fn();
  const mockTakeLeadingHandler = vi.fn();

  const saga = combineSagaHandlers({
    [WorkspaceActions.toggleUsingUpload.type]: mockTakeEveryHandler,
    [WorkspaceActions.toggleFolderMode.type]: {
      takeEvery: mockTakeEveryHandler
    },
    [WorkspaceActions.toggleUsingCse.type]: {
      takeLatest: mockTakeLatestHandler
    },
    [WorkspaceActions.toggleUsingSubst.type]: {
      takeLeading: mockTakeLeadingHandler
    },
    [WorkspaceActions.toggleEditorAutorun.type]: {
      takeEvery: mockTakeEveryHandler,
      takeLeading: mockTakeLeadingHandler
    }
  });

  testSaga(saga)
    .next()
    .takeEvery(WorkspaceActions.toggleUsingUpload.type, mockTakeEveryHandler)
    .next()
    .takeEvery(WorkspaceActions.toggleFolderMode.type, mockTakeEveryHandler)
    .next()
    .takeLatest(WorkspaceActions.toggleUsingCse.type, mockTakeLatestHandler)
    .next()
    .takeLeading(WorkspaceActions.toggleUsingSubst.type, mockTakeLeadingHandler)
    .next()
    .takeEvery(WorkspaceActions.toggleEditorAutorun.type, mockTakeEveryHandler)
    .next()
    .takeLeading(WorkspaceActions.toggleEditorAutorun.type, mockTakeLeadingHandler)
    .next()
    .isDone();
});

test('createActions', () => {
  const actions = createActions('workspace', {
    act0: false,
    act1: (value: string) => ({ value }),
    act2: 525600
  });

  const act0 = actions.act0();
  expect(act0.type).toEqual('workspace/act0');

  const act1 = actions.act1('test');
  expect(act1.type).toEqual('workspace/act1');
  expect(act1.payload).toMatchObject({ value: 'test' });

  const act2 = actions.act2();
  expect(act2.type).toEqual('workspace/act2');
});
