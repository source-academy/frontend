import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { mockBackendSaga } from '../mocks/BackendMocks';
import BackendSaga from '../redux/BackendSaga';
import { remoteExecutionSaga as RemoteExecutionSaga } from '../redux/remoteExec/RemoteExecRedux';
import { StoriesSaga } from '../redux/stories/StoriesSaga';
import WorkspaceSaga from '../redux/workspace/NewWorkspaceSaga';
import { PlaygroundSaga } from '../redux/workspace/playground/PlaygroundSaga';
import Constants from '../utils/Constants';
import AchievementSaga from './AchievementSaga';
import GitHubPersistenceSaga from './GitHubPersistenceSaga';
import LoginSaga from './LoginSaga';
import PersistenceSaga from './PersistenceSaga';

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
