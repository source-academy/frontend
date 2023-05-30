import { throttle } from 'lodash';
import { applyMiddleware, compose, createStore as _createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { defaultState } from '../commons/application/ApplicationTypes';
import createRootReducer from '../commons/application/reducers/RootReducer';
import MainSaga from '../commons/sagas/MainSaga';
import { generateOctokitInstance } from '../commons/utils/GitHubPersistenceHelper';
import { loadStoredState, SavedState, saveState } from './localStorage';

export const store = createStore();

export function createStore() {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware];

  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        serialize: true,
        maxAge: 300
      }) || compose
    : compose;

  const initialStore = loadStore(loadStoredState()) || defaultState;

  const enhancers = composeEnhancers(applyMiddleware(...middleware));

  const createdStore = _createStore(createRootReducer(), initialStore as any, enhancers);
  sagaMiddleware.run(MainSaga);

  createdStore.subscribe(
    throttle(() => {
      saveState(createdStore.getState());
    }, 1000)
  );

  return createdStore;
}

function loadStore(loadedStore: SavedState | undefined) {
  if (!loadedStore) {
    return undefined;
  }
  return {
    ...defaultState,
    session: {
      ...defaultState.session,
      ...(loadedStore.session ? loadedStore.session : {}),
      githubOctokitObject: {
        octokit: loadedStore.session.githubAccessToken
          ? generateOctokitInstance(loadedStore.session.githubAccessToken)
          : undefined
      }
    },
    workspaces: {
      ...defaultState.workspaces,
      playground: {
        ...defaultState.workspaces.playground,
        isFolderModeEnabled: loadedStore.playgroundIsFolderModeEnabled
          ? loadedStore.playgroundIsFolderModeEnabled
          : defaultState.workspaces.playground.isFolderModeEnabled,
        activeEditorTabIndex: loadedStore.playgroundActiveEditorTabIndex
          ? loadedStore.playgroundActiveEditorTabIndex.value
          : defaultState.workspaces.playground.activeEditorTabIndex,
        editorTabs: loadedStore.playgroundEditorTabs
          ? loadedStore.playgroundEditorTabs
          : defaultState.workspaces.playground.editorTabs,
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
