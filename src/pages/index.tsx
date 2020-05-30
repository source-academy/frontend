import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { setBackendStaticURL } from 'js-slang/dist/modules/moduleLoader';

import ApplicationContainer from 'src/commons/application/ApplicationContainer';
import { history } from 'src/commons/utils/HistoryHelper';
import Constants, { Links } from '../commons/utils/Constants';
import registerServiceWorker from '../commons/utils/RegisterServiceWorker';

import { store } from './createStore';
import './styles/index.css';

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
