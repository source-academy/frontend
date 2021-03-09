import { SagaIterator } from 'redux-saga';
import { takeLatest } from 'redux-saga/effects';

import {
  GITHUB_INITIALISE,
  GITHUB_OPEN_PICKER,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';

export function* GithubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, function* () {
    console.log('YEET SKEET LOGINEET');

    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    const windowName = 'Connect With OAuth';
    const windowSpecs = 'height=600,width=400';

    window.open(githubOauthLoginLink, windowName, windowSpecs);

    console.log('PEKO PEKO PAIN PEKO PAIN PAIN PAIN');
  });

  yield takeLatest(LOGOUT_GITHUB, function* () {});

  yield takeLatest(GITHUB_OPEN_PICKER, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE_AS, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE, function* () {});

  yield takeLatest(GITHUB_INITIALISE, function* () {});
}

export default GithubPersistenceSaga;
