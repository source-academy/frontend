import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_BEGIN_CONFIRMATION_DIALOG,
  GITHUB_BEGIN_OPEN_DIALOG,
  GITHUB_BEGIN_SAVE_AS_DIALOG,
  GITHUB_BEGIN_SAVE_DIALOG,
  GITHUB_CANCEL_CONFIRMATION_DIALOG,
  GITHUB_CLOSE_FILE_EXPLORER_DIALOG
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import FileExplorerDialog from '../gitHubOverlay/FileExplorerDialog';
import RepositoryDialog from '../gitHubOverlay/RepositoryDialog';
import { actions } from '../utils/ActionsHelper';
import { promisifyDialog } from '../utils/DialogHelper';
import { showSuccessMessage } from '../utils/NotificationsHelper';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, githubLoginSaga);
  yield takeLatest(LOGOUT_GITHUB, githubLogoutSaga);

  yield takeLatest(GITHUB_BEGIN_OPEN_DIALOG, githubDisplayOpenPickerSaga);
  yield takeLatest(GITHUB_BEGIN_SAVE_AS_DIALOG, githubDisplaySavePickerSaga);
  yield takeLatest(GITHUB_BEGIN_SAVE_DIALOG, githubQuicksaveSaga);
  yield takeLatest(GITHUB_CLOSE_FILE_EXPLORER_DIALOG, githubCloseFileExplorerSaga);

  yield takeLatest(GITHUB_BEGIN_CONFIRMATION_DIALOG, githubBeginConfirmationDialogSaga);
  yield takeLatest(GITHUB_CANCEL_CONFIRMATION_DIALOG, githubCancelConfirmationDialogSaga);
}

function* githubLoginSaga() {
  const clientId = GitHubUtils.getClientId();
  const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  const windowName = 'Connect With OAuth';
  const windowSpecs = 'height=600,width=400';

  // Create the broadcast channel
  const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

  broadcastChannel.onmessage = receivedMessage => {
    store.dispatch(actions.setGitHubOctokitInstance(receivedMessage.data));
  };

  // Creates a window directed towards the GitHub oauth link for this app
  // After the app has been approved by the user, it will be redirected to our GitHub callback page
  // We receive the auth token through our broadcast channel
  yield call(window.open, githubOauthLoginLink, windowName, windowSpecs);
}

function* githubLogoutSaga() {
  yield put(actions.removeGitHubOctokitInstance());
  yield call(showSuccessMessage, `Logged out from GitHub`, 1000);
}

function* githubDisplayOpenPickerSaga() {
  const octokit = GitHubUtils.getGitHubOctokitInstance() || {
    users: { getAuthenticated: () => {} },
    repos: { listForAuthenticatedUser: () => {} }
  };

  const results = yield call(octokit.repos.listForAuthenticatedUser);
  const userRepos = results.data;

  const repoName = yield call(promisifyDialog, RepositoryDialog, resolve => ({
    userRepos,
    onSubmit: resolve
  }));

  if (repoName !== '') {
    const pickerType = 'Open';
    yield call(promisifyDialog, FileExplorerDialog, resolve => ({
      octokit,
      repoName,
      pickerType,
      onSubmit: resolve
    }));
  }
}

function* githubDisplaySavePickerSaga() {
  const octokit = GitHubUtils.getGitHubOctokitInstance() || {
    users: { getAuthenticated: () => {} },
    repos: { listForAuthenticatedUser: () => {} }
  };

  const results = yield call(octokit.repos.listForAuthenticatedUser);
  const userRepos = results.data;

  const repoName = yield call(promisifyDialog, RepositoryDialog, resolve => ({
    userRepos,
    onSubmit: resolve
  }));

  if (repoName !== '') {
    const pickerType = 'Save';
    yield call(promisifyDialog, FileExplorerDialog, resolve => ({
      octokit,
      repoName,
      pickerType,
      onSubmit: resolve
    }));
  }
}

/*
function* githubOpenFileToEditor(repoName: string, filePath: string) {
  const octokit = GitHubUtils.getGitHubOctokitInstance() || {
    users: { getAuthenticated: () => {} },
    repos: { listForAuthenticatedUser: () => {} }
  };

  if (octokit === undefined) return;

  const AuthUser = yield call(octokit.users.getAuthenticated);
  const githubLoginID = AuthUser.data.login;
  const results = yield octokit.repos.getContent({
    owner: githubLoginID,
    repo: repoName,
    path: filePath
  });

  const content = results.data.content;

  if (content) {
    const newEditorValue = Buffer.from(content, 'base64').toString();
    console.log(newEditorValue); // This line below ain't working.
    yield put(actions.updateEditorValue(newEditorValue, 'playground'));
    showSuccessMessage('Successfully loaded file!', 1000);
  }
}
*/

function* githubQuicksaveSaga() {
  /*
    yield put(actions.setPickerType('Save'));
    yield put(actions.setGitHubSaveMode('Overwrite'));
    yield put(actions.setGitHubCommitMessage('Changes made from SourceAcademy'));
    yield put(actions.setGitHubConfirmationDialogStatus(true));
  */
}

function* githubCloseFileExplorerSaga() {
  yield put(actions.setPickerDialogStatus(false));
}

function* githubBeginConfirmationDialogSaga() {
  yield put(actions.setGitHubConfirmationDialogStatus(true));
}

function* githubCancelConfirmationDialogSaga() {
  yield put(actions.setGitHubConfirmationDialogStatus(false));
}

export default GitHubPersistenceSaga;
