import { Octokit } from '@octokit/rest';
import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_BEGIN_CONFIRMATION_DIALOG,
  GITHUB_BEGIN_OPEN_DIALOG,
  GITHUB_BEGIN_SAVE_AS_DIALOG,
  GITHUB_BEGIN_SAVE_DIALOG,
  GITHUB_CANCEL_CONFIRMATION_DIALOG,
  GITHUB_CLOSE_FILE_EXPLORER_DIALOG,
  GITHUB_CONFIRM_CREATING_SAVE,
  GITHUB_CONFIRM_OPEN,
  GITHUB_CONFIRM_OVERWRITING_SAVE
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, githubLoginSaga);
  yield takeLatest(LOGOUT_GITHUB, githubLogoutSaga);

  yield takeLatest(GITHUB_BEGIN_OPEN_DIALOG, githubDisplayOpenPickerSaga);
  yield takeLatest(GITHUB_BEGIN_SAVE_AS_DIALOG, githubDisplaySavePickerSaga);
  yield takeLatest(GITHUB_BEGIN_SAVE_DIALOG, githubQuicksaveSaga);
  yield takeLatest(GITHUB_CLOSE_FILE_EXPLORER_DIALOG, githubCloseFileExplorerSaga);

  yield takeLatest(GITHUB_BEGIN_CONFIRMATION_DIALOG, githubBeginConfirmationDialogSaga);
  yield takeLatest(GITHUB_CANCEL_CONFIRMATION_DIALOG, githubCancelConfirmationDialogSaga);
  yield takeLatest(GITHUB_CONFIRM_OPEN, githubConfirmOpenSaga);
  yield takeLatest(GITHUB_CONFIRM_OVERWRITING_SAVE, githubConfirmOverwritingSaveSaga);
  yield takeLatest(GITHUB_CONFIRM_CREATING_SAVE, githubConfirmCreatingSaveSaga);
}

function* githubLoginSaga() {
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
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
  yield store.dispatch(actions.removeGitHubOctokitInstance());
}

function* githubDisplayOpenPickerSaga() {
  const octokitInstance = store.getState().session.githubOctokitInstance || {
    users: { getAuthenticated: () => {} }, // getAuthenticated.data.login .data.name .data.email
    repos: { listForAuthenticatedUser: () => {} }
  };
  const AuthUser = yield call(octokitInstance.users.getAuthenticated);
  const userRepos = yield call(octokitInstance.repos.listForAuthenticatedUser);
  store.dispatch(actions.setGitHubLoginID(AuthUser.data.login));
  store.dispatch(actions.setGitHubName(AuthUser.data.name));
  store.dispatch(actions.setGitHubEmail(AuthUser.data.email));
  store.dispatch(actions.setGitHubUserRepos(userRepos.data));
  store.dispatch(actions.setPickerType('Open'));
  store.dispatch(actions.setPickerDialogStatus(true));
}

function* githubDisplaySavePickerSaga() {
  const octokitInstance = store.getState().session.githubOctokitInstance || {
    users: { getAuthenticated: () => {} }, // getAuthenticated.data.login .data.name .data.email
    repos: { listForAuthenticatedUser: () => {} }
  };
  const AuthUser = yield call(octokitInstance.users.getAuthenticated);
  const userRepos = yield call(octokitInstance.repos.listForAuthenticatedUser);
  store.dispatch(actions.setGitHubLoginID(AuthUser.data.login));
  store.dispatch(actions.setGitHubName(AuthUser.data.name));
  store.dispatch(actions.setGitHubEmail(AuthUser.data.email));
  store.dispatch(actions.setGitHubUserRepos(userRepos.data));
  store.dispatch(actions.setPickerType('Save'));
  store.dispatch(actions.setPickerDialogStatus(true));
}

function* githubQuicksaveSaga() {
  store.dispatch(actions.setPickerType('Save'));
  store.dispatch(actions.setGitHubSaveMode('Overwrite'));
  store.dispatch(actions.setGitHubCommitMessage('Changes made from SourceAcademy'));
  yield store.dispatch(actions.setGitHubConfirmationDialogStatus(true));
}

function* githubCloseFileExplorerSaga() {
  yield store.dispatch(actions.setPickerDialogStatus(false));
}

function* githubBeginConfirmationDialogSaga() {
  yield store.dispatch(actions.setGitHubConfirmationDialogStatus(true));
}

function* githubCancelConfirmationDialogSaga() {
  yield store.dispatch(actions.setGitHubConfirmationDialogStatus(false));
}

function* githubConfirmOpenSaga() {
  const octokit = GitHubUtils.getGitHubOctokitInstance() as Octokit;
  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;

  if (octokit === undefined) return;

  const results = yield octokit.repos.getContent({
    owner: githubLoginID,
    repo: repoName,
    path: filePath
  });

  const content = results.data.content;

  if (content) {
    //handleEditorValueChange(Buffer.from(content, 'base64').toString());
    const newEditorValue = Buffer.from(content, 'base64').toString();
    yield put(actions.updateEditorValue(newEditorValue, 'playground'));
    showSuccessMessage('Successfully loaded file!', 1000);
    store.dispatch(actions.setPickerDialogStatus(false));
  }
}

function* githubConfirmOverwritingSaveSaga() {
  const octokit = GitHubUtils.getGitHubOctokitInstance();

  if (octokit === undefined) {
    return;
  }

  const content = store.getState().workspaces.playground.editorValue || '';
  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const githubName = GitHubUtils.getGitHubName();
  const githubEmail = GitHubUtils.getGitHubEmail();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;
  const commitMessage = store.getState().session.githubCommitMessage;

  try {
    const results = yield octokit.repos.getContent({
      owner: githubLoginID,
      repo: repoName,
      path: filePath
    });

    const files = results.data;

    // Cannot save over folder
    if (Array.isArray(files)) {
      return;
    }

    const sha = files.sha;

    yield octokit.repos.createOrUpdateFileContents({
      owner: githubLoginID,
      repo: repoName,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      sha: sha,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });

    showSuccessMessage('Successfully saved file!', 1000);
    store.dispatch(actions.setPickerDialogStatus(false));
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

function* githubConfirmCreatingSaveSaga() {
  const octokit = GitHubUtils.getGitHubOctokitInstance();

  if (octokit === undefined) {
    return;
  }

  const content = store.getState().workspaces.playground.editorValue || '';
  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const githubName = GitHubUtils.getGitHubName();
  const githubEmail = GitHubUtils.getGitHubEmail();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;
  const commitMessage = store.getState().session.githubCommitMessage;

  try {
    yield octokit.repos.createOrUpdateFileContents({
      owner: githubLoginID,
      repo: repoName,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });

    showSuccessMessage('Successfully created file!', 1000);
    store.dispatch(actions.setPickerDialogStatus(false));
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

export default GitHubPersistenceSaga;
