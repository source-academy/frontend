import { SagaIterator } from 'redux-saga';
import { call, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_INITIALISE,
  GITHUB_OPEN_PICKER,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import { store } from '../../pages/createStore';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, GitHubLoginSaga);

  yield takeLatest(LOGOUT_GITHUB, GitHubLogoutSaga);

  yield takeLatest(GITHUB_OPEN_PICKER, function* () {
    const octokitInstance = store.getState().session.githubOctokitInstance || {
      users: { getAuthenticated: () => {} },
      repos: { listForAuthenticatedUser: () => {} }
    }; // getAuthenticated.data.login .data.name .data.email
    const username = yield call(octokitInstance.users.getAuthenticated);
    const userRepos = yield call(octokitInstance.repos.listForAuthenticatedUser);
    store.dispatch(actions.setGitHubUsername(username.data.login));
    store.dispatch(actions.setGitHubUserRepos(userRepos.data));
    store.dispatch(actions.setPickerDialog(true));
  });

  yield takeLatest(GITHUB_SAVE_FILE_AS, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE, function* () {});

  yield takeLatest(GITHUB_INITIALISE, function* () {});
}

export function* GitHubLoginSaga() {
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

export function* GitHubLogoutSaga() {
  yield store.dispatch(actions.removeGitHubOctokitInstance());
}

export default GitHubPersistenceSaga;
