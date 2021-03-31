import { expectSaga } from 'redux-saga-test-plan';

import { actions } from '../../../commons/utils/ActionsHelper';
import * as GitHubActions from '../../../features/github/GitHubActions';
import {
  REMOVE_GITHUB_OCTOKIT_INSTANCE,
  SET_GITHUB_CONFIRM_DIALOG_STATUS,
  SET_GITHUB_SAVE_MODE,
  SET_PICKER_DIALOG_STATUS,
  SET_PICKER_TYPE
} from '../../application/types/SessionTypes';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_INSTANCE being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: REMOVE_GITHUB_OCTOKIT_INSTANCE,
      payload: undefined,
      meta: undefined,
      error: undefined
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});

test('githubBeginSaveDialog opens confirmation dialog for overwriting save', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SET_PICKER_TYPE,
      payload: 'Save',
      meta: undefined,
      error: undefined
    })
    .put({
      type: SET_GITHUB_SAVE_MODE,
      payload: 'Overwrite',
      meta: undefined,
      error: undefined
    })
    .put({
      type: SET_GITHUB_CONFIRM_DIALOG_STATUS,
      payload: true,
      meta: undefined,
      error: undefined
    })
    .dispatch(GitHubActions.githubBeginSaveDialog())
    .silentRun();
});

test('githubCloseFileExplorerDialog closes file picker', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SET_PICKER_DIALOG_STATUS,
      payload: false,
      meta: undefined,
      error: undefined
    })
    .dispatch(GitHubActions.githubCloseFileExplorerDialog())
    .silentRun();
});

test('githubBeginConfirmationDialog opens Confirm Dialog', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SET_GITHUB_CONFIRM_DIALOG_STATUS,
      payload: true,
      meta: undefined,
      error: undefined
    })
    .dispatch(GitHubActions.githubBeginConfirmationDialog())
    .silentRun();
});

test('githubCancelConfirmationDialog closes Confirm Dialog', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SET_GITHUB_CONFIRM_DIALOG_STATUS,
      payload: false,
      meta: undefined,
      error: undefined
    })
    .dispatch(GitHubActions.githubCancelConfirmationDialog())
    .silentRun();
});
