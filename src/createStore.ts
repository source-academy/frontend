import { History } from 'history'
import { routerMiddleware, routerReducer } from 'react-router-redux'
import {
  applyMiddleware,
  compose,
  createStore as _createStore,
  Store,
  StoreEnhancer
} from 'redux'
import { persistCombineReducers, PersistConfig, Persistor, persistStore } from 'redux-persist'
import { createFilter } from 'redux-persist-transform-filter';
import storage from 'redux-persist/lib/storage' // defaults to localStorage 
import createSagaMiddleware from 'redux-saga'


import reducers from './reducers'
import {IState } from './reducers/states'
import mainSaga from './sagas'
import { history as appHistory } from './utils/history'


declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: () => StoreEnhancer<IState>

interface IPersistState {
  token?: string
}

function createStore(history: History): { store: Store<IState>, persistor: Persistor } {
  let composeEnhancers: any = compose
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [sagaMiddleware, routerMiddleware(history)]

  if (typeof __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function') {
    composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  }

  const saveAndloadSubsetFilter = createFilter<IState, IPersistState>(
    'session',
    ['token']
  );


  // const transIn: TransformIn<IState, IPersistState> = state => { 
  //   // tslint:disable-next-line:no-console
  //   console.log(state)
  //   return {
  //     token: state.session.token
  //  } 
  // }
  // const transOut: TransformOut<IPersistState, IState> = persistState => (
  //   {
  //     academy: defaultAcademy,
  //     application: defaultApplication,
  //     playground: defaultPlayground,
  //     session: {...defaultSession, ...persistState}
  //   }
  // )

  const persistConfig: PersistConfig = {
    key: 'root',
    storage,
    transforms: [saveAndloadSubsetFilter]
  }

  // const rootReducer = combineReducers<IState>()

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
