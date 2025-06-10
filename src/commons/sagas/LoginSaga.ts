import { setUser } from '@sentry/browser';
import { call } from 'redux-saga/effects';

import CommonsActions from '../application/actions/CommonsActions';
import SessionActions from '../application/actions/SessionActions';
import { combineSagaHandlers } from '../redux/utils';
import { computeEndpointUrl } from '../utils/AuthHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

const LoginSaga = combineSagaHandlers({
  [SessionActions.login.type]: function* ({ payload: providerId }) {
    const epUrl = computeEndpointUrl(providerId);
    if (!epUrl) {
      yield call(showWarningMessage, 'Could not log in; invalid provider name provided.');
      return;
    }
    window.location.href = epUrl;
  },
  [SessionActions.setUser.type]: function* (action) {
    yield call(setUser, { id: action.payload.userId.toString() });
  },
  [CommonsActions.logOut.type]: function* () {
    yield call(setUser, null);
  }
});

export default LoginSaga;
