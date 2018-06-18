import * as React from 'react'

import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

import ApplicationContainer from './containers/ApplicationContainer'
import { store } from './createStore'
import { history } from './utils/history'
import registerServiceWorker from './utils/registerServiceWorker'

import './styles/index.css'

const rootContainer = document.getElementById('root') as HTMLElement
;(window as any).__REDUX_STORE__ = store // need this for slang's display

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
)

registerServiceWorker()
