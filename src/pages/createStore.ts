import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet,setAutoFreeze } from 'immer'
import { throttle } from 'lodash';
import createSagaMiddleware from 'redux-saga';
import { defaultState, OverallState } from 'src/commons/redux/AllTypes';
import rootReducer from 'src/commons/redux/RootReducer';
import { defaultPlayground } from 'src/commons/redux/workspace/WorkspaceReduxTypes';

import MainSaga from '../commons/sagas/MainSaga';
import { generateOctokitInstance } from '../commons/utils/GitHubPersistenceHelper';
import { loadStoredState, SavedState, saveState } from './localStorage';

export const store = createStore();

export function createStore() {
  const sagaMiddleware = createSagaMiddleware();

  setAutoFreeze(false)
  enableMapSet()

  const initialStore = loadStore(loadStoredState()) || defaultState;
  const createdStore = configureStore({
    reducer: rootReducer,
    preloadedState: initialStore as any,
    middleware: getDefaultMiddleware => getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }).concat([
      sagaMiddleware
      // backendApi.middleware,
    ])
  });

  sagaMiddleware.run(MainSaga);

  createdStore.subscribe(
    throttle(() => {
      saveState(createdStore.getState());
    }, 1000)
  );

  return createdStore;
}

function loadStore(loadedStore: SavedState | undefined): OverallState | undefined {
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
        editorState: {
          ...defaultState.workspaces.playground.editorState,
          isFolderModeEnabled: loadedStore.playgroundIsFolderModeEnabled
            ? loadedStore.playgroundIsFolderModeEnabled
            : defaultState.workspaces.playground.editorState.isFolderModeEnabled,
          activeEditorTabIndex: loadedStore.playgroundActiveEditorTabIndex
            ? loadedStore.playgroundActiveEditorTabIndex.value
            : defaultPlayground.editorState.activeEditorTabIndex,
          editorTabs: loadedStore.playgroundEditorTabs
            ? loadedStore.playgroundEditorTabs
            : defaultPlayground.editorState.editorTabs,
          isEditorAutorun: loadedStore.playgroundIsEditorAutorun
            ? loadedStore.playgroundIsEditorAutorun
            : defaultState.workspaces.playground.editorState.isEditorAutorun,
        },
        // externalLibrary: loadedStore.playgroundExternalLibrary
        //   ? loadedStore.playgroundExternalLibrary
        //   : defaultState.workspaces.playground.externalLibrary,
        context: {
          ...defaultState.workspaces.playground.context,
          chapter: loadedStore.playgroundSourceChapter
            ? loadedStore.playgroundSourceChapter
            : defaultState.workspaces.playground.context.chapter,
          variant: loadedStore.playgroundSourceVariant
            ? loadedStore.playgroundSourceVariant
            : defaultState.workspaces.playground.context.variant
        }
      },
      stories: {
        ...defaultState.workspaces.stories,
        ...loadedStore.stories
      }
    }
  };
}
