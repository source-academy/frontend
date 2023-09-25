import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { mockBackendSaga } from '../mocks/BackendMocks';
import Constants from '../utils/Constants';
import AchievementSaga from './AchievementSaga';
import BackendSaga from './BackendSaga';
import CommonsSaga from './CommonsSaga';
import GitHubPersistenceSaga from './GitHubPersistenceSaga';
import LoginSaga from './LoginSaga';
import PersistenceSaga from './PersistenceSaga';
import PlaygroundSaga from './PlaygroundSaga';
import RemoteExecutionSaga from './RemoteExecutionSaga';
import SideContentSaga from './SideContentSaga';
import StoriesSaga from './StoriesSaga';
import WorkspaceSaga from './WorkspaceSaga';

export default function* MainSaga(): SagaIterator {
  yield fork(AchievementSaga);
  yield fork(Constants.useBackend ? BackendSaga : mockBackendSaga);
  yield fork(CommonsSaga);
  yield fork(GitHubPersistenceSaga);
  yield fork(LoginSaga);
  yield fork(PersistenceSaga);
  yield fork(PlaygroundSaga);
  yield fork(RemoteExecutionSaga);
  yield fork(SideContentSaga);
  yield fork(StoriesSaga);
  yield fork(WorkspaceSaga);
}
