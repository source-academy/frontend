import { setUser } from '@sentry/react';
import { call, select } from 'redux-saga/effects';
import Messages, { sendToWebview } from 'src/features/vscode/messages';

import CommonsActions from '../application/actions/CommonsActions';
import SessionActions from '../application/actions/SessionActions';
import { combineSagaHandlers } from '../redux/utils';
import { computeEndpointUrl } from '../utils/AuthHelper';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

const LoginSaga = combineSagaHandlers({
  [SessionActions.login.type]: function* ({ payload: providerId }) {
    const isVscode = yield select(state => state.vscode.isVscode);
    const epUrl = computeEndpointUrl(providerId, isVscode);
    if (!epUrl) {
      yield call(showWarningMessage, 'Could not log in; invalid provider name provided.');
      return;
    }
    if (!isVscode) {
      window.location.href = epUrl;
    } else {
      sendToWebview(Messages.LoginWithBrowser(epUrl));
    }
  },
  [SessionActions.setUser.type]: function* (action) {
    yield call(setUser, { id: action.payload.userId.toString() });
  },
  [CommonsActions.logOut.type]: function* () {
    yield call(setUser, null);
  }
});

export default LoginSaga;
