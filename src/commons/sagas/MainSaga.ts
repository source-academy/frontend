import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { mockBackendSaga } from '../mocks/BackendMocks';
import { PlaygroundSaga } from '../redux/workspace/playground/PlaygroundRedux'
import Constants from '../utils/Constants';
import AchievementSaga from './AchievementSaga';
import BackendSaga from './BackendSaga';
import GitHubPersistenceSaga from './GitHubPersistenceSaga';
import LoginSaga from './LoginSaga';
import PersistenceSaga from './PersistenceSaga';
import RemoteExecutionSaga from './RemoteExecutionSaga';
import StoriesSaga from './StoriesSaga';
import WorkspaceSaga from './WorkspaceSaga';

export default function* MainSaga(): SagaIterator {
  yield fork(Constants.useBackend ? BackendSaga : mockBackendSaga);
  yield fork(WorkspaceSaga);
  yield fork(LoginSaga);
  yield fork(PlaygroundSaga);
  yield fork(AchievementSaga);
  yield fork(PersistenceSaga);
  yield fork(GitHubPersistenceSaga);
  yield fork(RemoteExecutionSaga);
  yield fork(StoriesSaga);
}
