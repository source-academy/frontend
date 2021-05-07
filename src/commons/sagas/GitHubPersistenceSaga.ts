import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_OPEN_FILE,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import FileExplorerDialog from '../gitHubOverlay/FileExplorerDialog';
import RepositoryDialog from '../gitHubOverlay/RepositoryDialog';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { promisifyDialog } from '../utils/DialogHelper';
import { showSuccessMessage } from '../utils/NotificationsHelper';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, githubLoginSaga);
  yield takeLatest(LOGOUT_GITHUB, githubLogoutSaga);

  yield takeLatest(GITHUB_OPEN_FILE, githubOpenFile);
  yield takeLatest(GITHUB_SAVE_FILE, githubSaveFile);
  yield takeLatest(GITHUB_SAVE_FILE_AS, githubSaveFileAs);
}

function* githubLoginSaga() {
  const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${Constants.githubClientId}&scope=repo`;
  const windowName = 'Connect With OAuth';
  const windowSpecs = 'height=600,width=400';

  // Create the broadcast channel
  const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

  broadcastChannel.onmessage = receivedMessage => {
    store.dispatch(actions.setGitHubOctokitObject(receivedMessage.data));
    showSuccessMessage('Logged in to GitHub', 1000);
  };

  if (!Constants.githubClientId) {
    // Direct to the callback page to show the error messages
    yield call(window.open, `/callback/github`, windowName, windowSpecs);
  } else {
    // Creates a window directed towards the GitHub oauth link for this app
    // After the app has been approved by the user, it will be redirected to our GitHub callback page
    // We receive the auth token through our broadcast channel
    yield call(window.open, githubOauthLoginLink, windowName, windowSpecs);
  }
}

function* githubLogoutSaga() {
  yield put(actions.removeGitHubOctokitObject());
  yield call(showSuccessMessage, `Logged out from GitHub`, 1000);
}

function* githubOpenFile() {
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

  const editorContent = '';

  if (repoName !== '') {
    const pickerType = 'Open';
    yield call(promisifyDialog, FileExplorerDialog, resolve => ({
      octokit,
      repoName,
      pickerType,
      editorContent,
      onSubmit: resolve
    }));
  }
}

function* githubSaveFile() {
  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;
  const authUser = yield call(octokit.users.getAuthenticated);
  const githubLoginId = authUser.data.login;
  const repoName = store.getState().playground.githubSaveInfo.repoName;
  const filePath = store.getState().playground.githubSaveInfo.filePath;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';
  const content = store.getState().workspaces.playground.editorValue;

  GitHubUtils.performOverwritingSave(
    octokit,
    githubLoginId,
    repoName,
    filePath,
    githubEmail,
    githubName,
    commitMessage,
    content
  );
}

function* githubSaveFileAs() {
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

  const editorContent = store.getState().workspaces.playground.editorValue;

  if (repoName !== '') {
    const pickerType = 'Save';
    yield call(promisifyDialog, FileExplorerDialog, resolve => ({
      octokit,
      repoName,
      pickerType,
      editorContent,
      onSubmit: resolve
    }));
  }
}

export default GitHubPersistenceSaga;
