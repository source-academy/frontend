import * as React from 'react'

import { createBrowserHistory } from 'history'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import { Store } from 'redux'

import ApplicationContainer from './containers/ApplicationContainer'
import createStore from './createStore'
import { IState } from './reducers/states'
import registerServiceWorker from './registerServiceWorker'

import './styles/index.css'

const rootContainer = document.getElementById('root') as HTMLElement
const history = createBrowserHistory()
const store = createStore(history) as Store<IState>
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
