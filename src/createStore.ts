import { throttle } from 'lodash';
import { routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore as _createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { ISavedState, loadStoredState, saveState } from './localStorage';
import { defaultState } from './reducers/states';
import mainSaga from './sagas';
import { history as appHistory } from './utils/history';
import createRootReducer from './reducers';

const initialStore = loadStore(loadStoredState()) || defaultState;
export const store = createdStore(initialStore);

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      serialize: true,
      maxAge: 300
    }) || compose
  : compose;

export default function createdStore(initialStore: any) {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware, routerMiddleware(appHistory)];

  const enhancers = composeEnhancers(applyMiddleware(...middleware));

  const createdStore = _createStore(createRootReducer(appHistory), initialStore, enhancers);
  sagaMiddleware.run(mainSaga);

  createdStore.subscribe(
    throttle(() => {
      saveState(createdStore.getState());
    }, 1000)
  );

  return createdStore;
}

function loadStore(loadedStore: ISavedState | undefined) {
  if (!loadedStore) return { undefined };
  return {
    ...defaultState,
    session: {
      ...defaultState.session,
      ...(loadedStore.session ? loadedStore.session : {})
    },
    workspaces: {
      ...defaultState.workspaces,
      playground: {
        ...defaultState.workspaces.playground,
        editorValue: loadedStore.playgroundEditorValue
          ? loadedStore.playgroundEditorValue
          : defaultState.workspaces.playground.editorValue,
        isEditorAutorun: loadedStore.playgroundIsEditorAutorun
          ? loadedStore.playgroundIsEditorAutorun
          : defaultState.workspaces.playground.isEditorAutorun,
        externalLibrary: loadedStore.playgroundExternalLibrary
          ? loadedStore.playgroundExternalLibrary
          : defaultState.workspaces.playground.externalLibrary,
        context: {
          ...defaultState.workspaces.playground.context,
          chapter: loadedStore.playgroundSourceChapter
            ? loadedStore.playgroundSourceChapter
            : defaultState.workspaces.playground.context.chapter,
          variant: loadedStore.playgroundSourceVariant
            ? loadedStore.playgroundSourceVariant
            : defaultState.workspaces.playground.context.variant
        }
      }
    }
  };
}
