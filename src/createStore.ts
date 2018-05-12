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
import reducers, { IState } from './reducers'

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

export default function createStore(history: History): Store<IState> {
  const middleware = [routerMiddleware(history)]

  let composeEnhancers: any = compose
  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  const enchancers = composeEnhancers(applyMiddleware(...middleware))

  return _createStore(
    combineReducers({
      ...reducers,
      router: routerReducer
    }),
    enchancers
  )
}
