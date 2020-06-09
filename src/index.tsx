import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/browser';

import { setBackendStaticURL } from 'js-slang/dist/modules/moduleLoader';

import ApplicationContainer from 'src/commons/application/ApplicationContainer';
import Constants, { Links } from 'src/commons/utils/Constants';
import { history } from 'src/commons/utils/HistoryHelper';
import registerServiceWorker from 'src/commons/utils/RegisterServiceWorker';
import { store } from 'src/pages/createStore';
import 'src/styles/index.scss';

if (Constants.sentryDsn) {
  Sentry.init({ dsn: Constants.sentryDsn });
}

const rootContainer = document.getElementById('root') as HTMLElement;
(window as any).__REDUX_STORE__ = store; // need this for slang's display
// tslint:disable-next-line
console.log(
  `%c Source Academy ${Constants.sourceAcademyVersion}; ` +
    `Please visit ${Links.githubIssues} to report bugs or issues.`,
  'font-weight: bold;'
);

setBackendStaticURL(Constants.moduleBackendUrl);
// tslint:disable-next-line
console.log(`Using module backend: ${Constants.moduleBackendUrl}`);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
);

registerServiceWorker();
