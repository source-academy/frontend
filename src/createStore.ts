import { History } from 'history'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  compose,
  createStore as _createStore,
  Store,
  StoreEnhancer
} from 'redux'
import { Persistor, persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage 
import createSagaMiddleware from 'redux-saga'

import reducers from './reducers'
import { IState } from './reducers/states'
import mainSaga from './sagas'
import { history as appHistory } from './utils/history'

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

function createStore(history: History): { store: Store<IState>, persistor: Persistor } {
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

  const persistConfig = {
    key: 'root',
    storage,
  }
  const persistedReducer: (state: {}, action: AnyAction) => {} = persistReducer(persistConfig, rootReducer)

  const enchancers = composeEnhancers(applyMiddleware(...middleware))
  const createdStore = _createStore(persistedReducer, enchancers) as Store<IState>
  const createdPersistor = persistStore(createdStore)
  sagaMiddleware.run(mainSaga)
  return { store: createdStore, persistor: createdPersistor }
}

const storeAndPersistor = createStore(appHistory) 
export const persistor = storeAndPersistor.persistor
export const store = storeAndPersistor.store
