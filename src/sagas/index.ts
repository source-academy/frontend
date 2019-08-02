import { mockBackendSaga } from '../mocks/backend';
import { USE_BACKEND } from '../utils/constants';
import backendSaga from './backend';
import loginSaga from './login';
import playgroundSaga from './playground';
import workspaceSaga from './workspaces';

export default function* mainSaga() {
  yield* USE_BACKEND ? backendSaga() : mockBackendSaga();
  yield* workspaceSaga();
  yield* loginSaga();
  yield* playgroundSaga();
}
