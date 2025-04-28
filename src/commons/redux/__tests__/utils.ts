import { testSaga } from "redux-saga-test-plan"
import WorkspaceActions from "src/commons/workspace/WorkspaceActions"

import { combineSagaHandlers } from "../utils"

// Would have used spyOn, but for some reason that doesn't work properly
jest.mock('src/commons/sagas/SafeEffects', () => ({
  ...jest.requireActual('src/commons/sagas/SafeEffects'),
  // Mock wrap saga to just be a passthrough so that the identity
  // checking that testSaga uses will pass
  wrapSaga: (x: any) => x
}))

test('test combineSagaHandlers', () => {
  const mockTakeEveryHandler = jest.fn()
  const mockTakeLatestHandler = jest.fn()
  const mockTakeLeadingHandler = jest.fn()

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
    }
  })

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
    .isDone()
})
