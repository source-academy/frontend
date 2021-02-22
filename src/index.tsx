import 'src/styles/index.scss';

import * as Sentry from '@sentry/browser';
import { ConnectedRouter } from 'connected-react-router';
import { setBackendStaticURL } from 'js-slang/dist/modules/moduleLoader';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import ApplicationContainer from 'src/commons/application/ApplicationContainer';
import Constants, { Links } from 'src/commons/utils/Constants';
import { history } from 'src/commons/utils/HistoryHelper';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';
import { register as registerServiceWorker } from 'src/commons/utils/RegisterServiceWorker';
import { triggerSyncLogs } from 'src/features/eventLogging/client';
import { store } from 'src/pages/createStore';

if (Constants.sentryDsn) {
  Sentry.init({
    dsn: Constants.sentryDsn,
    environment: Constants.sourceAcademyEnvironment,
    release: `cadet-frontend@${Constants.sourceAcademyVersion}`
  });
  const userId = store.getState().session.userId;
  Sentry.setUser(typeof userId !== 'undefined' ? { id: userId.toString() } : null);
}

const rootContainer = document.getElementById('root') as HTMLElement;
(window as any).__REDUX_STORE__ = store; // need this for slang's display
console.log(
  `%cSource Academy ${Constants.sourceAcademyEnvironment}-${Constants.sourceAcademyVersion}; ` +
    `Please visit ${Links.githubIssues} to report bugs or issues.`,
  'font-weight: bold;'
);

setBackendStaticURL(Constants.moduleBackendUrl);
console.log(`Using module backend: ${Constants.moduleBackendUrl}`);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
);

registerServiceWorker({
  onUpdate: () => {
    showWarningMessage(
      'A new version of Source Academy is available. Please refresh the browser.',
      0
    );
  }
});

if (Constants.cadetLoggerUrl) {
  // Seriously: registerServiceWorker onSuccess and onUpdate are separate paths.
  // Neither of them actually fire in localhost...
  const sync = () => triggerSyncLogs(store.getState().session.accessToken);
  navigator.serviceWorker.ready.then(() => {
    setInterval(sync, Constants.cadetLoggerInterval);
  });
}
