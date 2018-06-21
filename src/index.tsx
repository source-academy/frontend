import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { PersistGate } from 'redux-persist/integration/react';

import ApplicationContainer from './containers/ApplicationContainer'
import { persistor, store } from './createStore'
import { VERSION } from './utils/constants'
import { history } from './utils/history'
import registerServiceWorker from './utils/registerServiceWorker'

import './styles/index.css'

const rootContainer = document.getElementById('root') as HTMLElement
;(window as any).__REDUX_STORE__ = store // need this for slang's display
// tslint:disable-next-line
console.log(
  `%c Source Academy v${VERSION}; ` +
    'Please visit https://github.com/source-academy/cadet-frontend/issues to report bugs or issues.',
  'font-weight: bold;'
)

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConnectedRouter history={history}>
        <ApplicationContainer />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  rootContainer
)

registerServiceWorker()
