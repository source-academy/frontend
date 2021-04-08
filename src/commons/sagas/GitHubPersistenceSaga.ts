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
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';

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
  const octokit = GitHubUtils.getGitHubOctokitInstance() || {
    users: { getAuthenticated: () => {} },
    repos: { listForAuthenticatedUser: () => {} }
  };
  const AuthUser = yield call(octokit.users.getAuthenticated);
  const githubLoginID = AuthUser.data.login;
  const repoName = store.getState().session.githubSaveInfo.repoName;
  const filePath = store.getState().session.githubSaveInfo.filePath;
  try {
    const results = yield octokit.repos.getContent({
      owner: githubLoginID,
      repo: repoName,
      path: filePath
    });
    const commitMessage = 'Changes made from Source Academy';
    const editorContent = store.getState().workspaces.playground.editorValue || '';
    const editorContentEncoded = Buffer.from(editorContent, 'utf8').toString('base64');
    const sha = results.data.sha;
    const githubName = AuthUser.data.name || '';
    const githubEmail = AuthUser.data.email || '';
    yield octokit.repos.createOrUpdateFileContents({
        owner: githubLoginID,
        repo: repoName,
        path: filePath,
        message: commitMessage,
        content: editorContentEncoded,
        sha: sha,
        committer: { name: githubName, email: githubEmail },
        author: { name: githubName, email: githubEmail }
    });
    showSuccessMessage('Successfully saved file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
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
