import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';

import { mockBackendSaga } from '../mocks/BackendMocks';
import Constants from '../utils/Constants';
import AchievementSaga from './AchievementSaga';
import BackendSaga from './BackendSaga';
import LoginSaga from './LoginSaga';
import PersistenceSaga from './PersistenceSaga';
import PlaygroundSaga from './PlaygroundSaga';
import RemoteExecutionSaga from './RemoteExecutionSaga';
import WorkspaceSaga from './WorkspaceSaga';

export default function* MainSaga(): SagaIterator {
  yield fork(Constants.useBackend ? BackendSaga : mockBackendSaga);
  yield fork(WorkspaceSaga);
  yield fork(LoginSaga);
  yield fork(PlaygroundSaga);
  yield fork(AchievementSaga);
  yield fork(PersistenceSaga);
  yield fork(RemoteExecutionSaga);
}
