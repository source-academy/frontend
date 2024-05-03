import { configureStore } from '@reduxjs/toolkit';
import { setAutoFreeze } from 'immer';
import { throttle } from 'lodash';
import createSagaMiddleware from 'redux-saga';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultState, OverallState } from '../commons/application/ApplicationTypes';
import rootReducer from '../commons/application/reducers/RootReducer';
import MainSaga from '../commons/sagas/MainSaga';
import { generateOctokitInstance } from '../commons/utils/GitHubPersistenceHelper';
import { loadStoredState, SavedState, saveState } from './localStorage';

// FIXME: Hotfix: Disable auto freezing of states for RTK as this breaks the code evaluation sagas
setAutoFreeze(false);

export const store = createStore();

export function createStore() {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware];
  const initialStore = loadStore(loadStoredState()) || defaultState;

  const createdStore = configureStore<OverallState, SourceActionType>({
    reducer: rootReducer,
    // Fix for redux-saga type incompatibility
    // See: https://github.com/reduxjs/redux-toolkit/issues/3950
    middleware: middleware as any,
    devTools: { serialize: true, maxAge: 300 },
    // We already provide the generic type argument, so we put
    // `as any` to prevent excessively long type inference
    preloadedState: initialStore as any
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
    },
    stories: {
      ...defaultState.stories,
      ...loadedStore.stories
    }
  };
}
