import { SagaIterator } from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { mockBackendSaga } from '../mocks/BackendMocks';
import Constants from '../utils/Constants';
import BackendSaga from './BackendSaga';
import LoginSaga from './LoginSaga';
import PlaygroundSaga from './PlaygroundSaga';
import WorkspaceSaga from './WorkspaceSaga';
// import AchievementSaga from '../achievements/AchievementSaga';

export default function* MainSaga(): SagaIterator {
  yield fork(Constants.useBackend ? BackendSaga : mockBackendSaga);
  yield fork(WorkspaceSaga);
  yield fork(LoginSaga);
  yield fork(PlaygroundSaga);
  // yield fork(AchievementSaga);
}
