import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

import ApplicationContainer from './containers/ApplicationContainer'
import { store } from './createStore'
import { saveState as _saveState } from './localStorage'
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

const saveState = (state: any) => {
  // tslint:disable-next-line
  console.log("Saving State: \n" + JSON.stringify(state))
  _saveState(
    state
  )
}

store.subscribe(() => {
  saveState(store.getState())
});

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ApplicationContainer />
    </ConnectedRouter>
  </Provider>,
  rootContainer
)

registerServiceWorker()
