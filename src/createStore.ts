import { History } from 'history'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as _createStore,
  Store,
  StoreEnhancer
} from 'redux'
import createSagaMiddleware from 'redux-saga'

import { loadStoredState } from './localStorage'
import reducers from './reducers'
import { defaultState , IState } from './reducers/states'
import mainSaga from './sagas'
import { history as appHistory } from './utils/history'

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

function createStore(history: History): Store<IState> {
  let composeEnhancers: any = compose
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [sagaMiddleware, routerMiddleware(history)]

  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  const rootReducer = combineReducers<IState>({
    ...reducers,
    router: routerReducer
  })
  const enchancers = composeEnhancers(applyMiddleware(...middleware))
  const loadedStore = loadStoredState() || defaultState
  // tslint:disable-next-line
  console.log("Loading: \n" + JSON.stringify(loadedStore))
  const createdStore = _createStore(rootReducer, loadedStore, enchancers)

  sagaMiddleware.run(mainSaga)
  return createdStore
}

export const store = createStore(appHistory) as Store<IState>
