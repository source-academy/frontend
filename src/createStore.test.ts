import { Variant } from 'js-slang/dist/types';

import { compressToUTF16 } from 'lz-string';
import { ExternalLibraryName } from './components/assessment/assessmentShape';
import { createStore } from './createStore';
import { ISavedState } from './localStorage';
import { defaultState, IState } from './reducers/states';
import { DEFAULT_SOURCE_CHAPTER } from './utils/constants';
import { history } from './utils/history';

const mockChangedStoredState: ISavedState = {
  session: {
    accessToken: 'yep',
    refreshToken: 'refresherOrb',
    role: undefined,
    name: 'Jeff'
  },
  playgroundEditorValue: 'Nihao everybody',
  playgroundIsEditorAutorun: true,
  playgroundSourceChapter: DEFAULT_SOURCE_CHAPTER,
  playgroundSourceVariant: 'default' as Variant,
  playgroundExternalLibrary: 'NONE' as ExternalLibraryName
};

const mockChangedState: IState = {
  ...defaultState,
  session: {
    ...defaultState.session,
    accessToken: 'yep',
    refreshToken: 'refresherOrb',
    role: undefined,
    name: 'Jeff'
  },
  workspaces: {
    ...defaultState.workspaces,
    playground: {
      ...defaultState.workspaces.playground,
      editorValue: 'Nihao everybody',
      isEditorAutorun: true
    }
  }
};

const defaultRouter = {
  action: 'POP',
  location: {
    hash: '',
    pathname: '/',
    query: {},
    search: '',
    state: undefined
  }
};
describe('createStore() function', () => {
  test('has defaultState when initialised', () => {
    localStorage.removeItem('storedState');
    expect(createStore(history).getState()).toEqual({
      ...defaultState,
      router: defaultRouter
    });
  });
  test('has correct getState() when called with storedState', () => {
    localStorage.setItem('storedState', compressToUTF16(JSON.stringify(mockChangedStoredState)));
    expect(createStore(history).getState()).toEqual({
      ...mockChangedState,
      router: defaultRouter
    });
    localStorage.removeItem('storedState');
  });
});
