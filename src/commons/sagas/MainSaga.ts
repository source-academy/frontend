import { SagaIterator } from 'redux-saga';
import { all, fork } from 'redux-saga/effects';

import { mockBackendSaga } from '../mocks/BackendMocks';
import Constants from '../utils/Constants';
import AchievementSaga from './AchievementSaga';
import BackendSaga from './BackendSaga';
import GitHubPersistenceSaga from './GitHubPersistenceSaga';
import LoginSaga from './LoginSaga';
import PersistenceSaga from './PersistenceSaga';
import PlaygroundSaga from './PlaygroundSaga';
import RemoteExecutionSaga from './RemoteExecutionSaga';
import SideContentSaga from './SideContentSaga';
import StoriesSaga from './StoriesSaga';
import WorkspaceSaga from './WorkspaceSaga';

export default function* MainSaga(): SagaIterator {
  yield all([
    fork(Constants.useBackend ? BackendSaga : mockBackendSaga),
    fork(WorkspaceSaga),
    fork(LoginSaga),
    fork(PlaygroundSaga),
    fork(AchievementSaga),
    fork(PersistenceSaga),
    fork(GitHubPersistenceSaga),
    fork(RemoteExecutionSaga),
    fork(StoriesSaga),
    fork(SideContentSaga)
  ]);
}
