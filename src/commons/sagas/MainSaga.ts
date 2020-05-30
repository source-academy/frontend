import { mockBackendSaga } from '../mocks/BackendMocks';
import Constants from '../utils/Constants';
import BackendSaga from './BackendSaga';
import LoginSaga from './LoginSaga';
import PlaygroundSaga from './PlaygroundSaga';
import WorkspaceSaga from './WorkspaceSaga';

export default function* MainSaga() {
  yield* Constants.useBackend ? BackendSaga() : mockBackendSaga();
  yield* WorkspaceSaga();
  yield* LoginSaga();
  yield* PlaygroundSaga();
}
