import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import ApplicationContainer from './containers/ApplicationContainer';
import { store } from './createStore';
import { LINKS, SOURCE_ACADEMY_VERSION, MODULES_BACKEND_URL } from './utils/constants';
import { history } from './utils/history';
import registerServiceWorker from './utils/registerServiceWorker';

import { setBackendStaticURL } from 'js-slang/dist/modules/moduleLoader'

import './styles/index.css';

const rootContainer = document.getElementById('root') as HTMLElement;
(window as any).__REDUX_STORE__ = store; // need this for slang's display
// tslint:disable-next-line
console.log(
  `%c Source Academy ${SOURCE_ACADEMY_VERSION}; ` +
    `Please visit ${LINKS.GITHUB_ISSUES} to report bugs or issues.`,
  'font-weight: bold;'
);

setBackendStaticURL(MODULES_BACKEND_URL)

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
);

registerServiceWorker();
