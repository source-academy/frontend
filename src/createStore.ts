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
import reducers from './reducers'
import { IState } from './reducers/states'

import createSagaMiddleware from 'redux-saga'
import mainSaga from './sagas'

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

function createStore(history: History): Store<IState> {
  let composeEnhancers: any = compose
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [sagaMiddleware, routerMiddleware(history)]

  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  const rootReducer = combineReducers({
    ...reducers,
    router: routerReducer
  })
  const enchancers = composeEnhancers(applyMiddleware(...middleware))
  const createdStore = _createStore(rootReducer, enchancers)

  sagaMiddleware.run(mainSaga)
  return createdStore
}

export default createStore
