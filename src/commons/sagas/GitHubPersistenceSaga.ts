import { SagaIterator } from 'redux-saga';
import { takeLatest } from 'redux-saga/effects';

import {
  GITHUB_INITIALISE,
  GITHUB_OPEN_PICKER,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import { store } from '../../pages/createStore';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';

export function* GithubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, function* () {
    const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    const windowName = 'Connect With OAuth';
    const windowSpecs = 'height=600,width=400';

    yield window.open(githubOauthLoginLink, windowName, windowSpecs);

    yield (broadcastChannel.onmessage = receivedMessage => {
      store.dispatch(actions.setGitHubOctokitInstance(receivedMessage.data));
    });
  });

  yield takeLatest(LOGOUT_GITHUB, function* () {
    yield store.dispatch(actions.removeGitHubOctokitInstance());
  });

  yield takeLatest(GITHUB_OPEN_PICKER, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE_AS, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE, function* () {});

  yield takeLatest(GITHUB_INITIALISE, function* () {});
}

export default GithubPersistenceSaga;
