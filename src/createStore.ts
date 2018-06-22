import { History } from 'history'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import { applyMiddleware, compose, createStore as _createStore, Store, StoreEnhancer } from 'redux'
import { persistCombineReducers, PersistConfig, Persistor, persistStore } from 'redux-persist'
import { createFilter } from 'redux-persist-transform-filter'
import storage from 'redux-persist/lib/storage' // defaults to localStorage
import createSagaMiddleware from 'redux-saga'

import reducers from './reducers'
import { IApplicationState, IPlaygroundState, ISessionState, IState } from './reducers/states'
import mainSaga from './sagas'
import { history as appHistory } from './utils/history'

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

type IPersistState =
  Pick<IApplicationState, 'environment'>
  & Pick<IPlaygroundState, 'editorValue'>
  & Pick<ISessionState, 'historyHelper'>
  & Pick<ISessionState, 'token'>
  & Pick<ISessionState, 'username'>

function createStore(history: History): { store: Store<IState>; persistor: Persistor } {
  let composeEnhancers: any = compose
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [sagaMiddleware, routerMiddleware(history)]

  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }
  
  const transforms = [
    createFilter<IState, IPersistState>('application', ['environment']),
    createFilter<IState, IPersistState>('playground', ['editorValue']),
    createFilter<IState, IPersistState>('session', ['token', 'username', 'historyHelper'])
  ]


  const persistConfig: PersistConfig = {
    key: 'root',
    storage,
    transforms: [...transforms]
  }

  const persistedReducer = persistCombineReducers<IState>(persistConfig, {
    ...reducers,
    router: routerReducer
  })

  const enchancers = composeEnhancers(applyMiddleware(...middleware))
  const createdStore = _createStore(persistedReducer, enchancers) as Store<IState>
  const createdPersistor = persistStore(createdStore)
  sagaMiddleware.run(mainSaga)
  return { store: createdStore, persistor: createdPersistor }
}

const storeAndPersistor = createStore(appHistory)
export const persistor = storeAndPersistor.persistor
export const store = storeAndPersistor.store
