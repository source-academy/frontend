import { configureStore } from '@reduxjs/toolkit';
import { throttle } from 'lodash';
import createSagaMiddleware from 'redux-saga';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { defaultPlayground } from 'src/commons/redux/workspace/playground/PlaygroundRedux';

import { defaultState } from '../commons/application/ApplicationTypes';
import createRootReducer from '../commons/application/reducers/RootReducer';
import { apiMiddleware } from '../commons/redux/BackendSlice';
import MainSaga from '../commons/sagas/MainSaga';
import { generateOctokitInstance } from '../commons/utils/GitHubPersistenceHelper';
import { loadStoredState, SavedState, saveState } from './localStorage';

export const store = createStore();

export function createStore() {
  const sagaMiddleware = createSagaMiddleware();

  const initialStore = loadStore(loadStoredState()) || defaultState;

  const createdStore = configureStore({
    reducer: createRootReducer(),
    preloadedState: initialStore as any,
    middleware: [
      sagaMiddleware,
      apiMiddleware,
      // backendApi.middleware,
    ],
  });

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
          : defaultPlayground.editorState.activeEditorTabIndex,
        editorTabs: loadedStore.playgroundEditorTabs
          ? loadedStore.playgroundEditorTabs
          : defaultPlayground.editorState.editorTabs,
        isEditorAutorun: loadedStore.playgroundIsEditorAutorun
          ? loadedStore.playgroundIsEditorAutorun
          : defaultState.workspaces.playground.isEditorAutorun,
        externalLibrary: ExternalLibraryName.NONE,
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
      }
    },
    stories: {
      ...defaultState.stories,
      ...loadedStore.stories
    }
  };
}
