import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_OPEN_FILE,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
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

  yield takeLatest(GITHUB_OPEN_FILE, githubOpenFile);
  yield takeLatest(GITHUB_SAVE_FILE, githubSaveFile);
  yield takeLatest(GITHUB_SAVE_FILE_AS, githubSaveFileAs);
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
    showSuccessMessage('Logged in to GitHub', 1000);
  };

  if (clientId === '') {
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
  yield put(actions.removeGitHubOctokitInstance());
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

function* githubSaveFile() {
  const octokit = GitHubUtils.getGitHubOctokitInstance();
  const authUser = yield call(octokit.users.getAuthenticated);
  const githubLoginId = authUser.data.login;
  const repoName = store.getState().playground.githubSaveInfo.repoName;
  const filePath = store.getState().playground.githubSaveInfo.filePath;
  const githubEmail = authUser.data.email || 'No public email provided';
  const githubName = authUser.data.name || 'Source Academy User';
  const commitMessage = 'Changes made from Source Academy';

  console.log(githubLoginId);
  console.log(repoName);
  console.log(filePath);
  console.log(githubEmail);
  console.log(githubName);
  console.log(commitMessage);

  GitHubUtils.performOverwritingSave(
    octokit,
    githubLoginId,
    repoName,
    filePath,
    githubEmail,
    githubName,
    commitMessage
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

export default GitHubPersistenceSaga;
