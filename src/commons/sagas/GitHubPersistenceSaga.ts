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
  yield takeLatest(LOGIN_GITHUB, function* () {});

  yield takeLatest(LOGOUT_GITHUB, function* () {});

  yield takeLatest(GITHUB_OPEN_PICKER, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE_AS, function* () {});

  yield takeLatest(GITHUB_SAVE_FILE, function* () {});

  yield takeLatest(GITHUB_INITIALISE, function* () {});
}

export default GithubPersistenceSaga;
