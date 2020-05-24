import { setBackendStaticURL } from 'js-slang/dist/modules/moduleLoader';

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import ApplicationContainer from 'src/commons/application/ApplicationContainer';
import { store } from './createStore';
import { LINKS, MODULE_BACKEND_URL, SOURCE_ACADEMY_VERSION } from 'src/utils/constants';
import { history } from 'src/utils/history';
import registerServiceWorker from 'src/utils/registerServiceWorker';

import './styles/index.css';

const rootContainer = document.getElementById('root') as HTMLElement;
(window as any).__REDUX_STORE__ = store; // need this for slang's display
// tslint:disable-next-line
console.log(
  `%c Source Academy ${SOURCE_ACADEMY_VERSION}; ` +
    `Please visit ${LINKS.GITHUB_ISSUES} to report bugs or issues.`,
  'font-weight: bold;'
);

setBackendStaticURL(MODULE_BACKEND_URL);
// tslint:disable-next-line
console.log(`Using module backend: ${MODULE_BACKEND_URL}`);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
);

registerServiceWorker();
