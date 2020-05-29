import { Variant } from 'js-slang/dist/types';

import { compressToUTF16 } from 'lz-string';

import { defaultState, OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { DEFAULT_SOURCE_CHAPTER } from '../../utils/constants';
import { history } from '../../utils/history';
import { createStore } from '../createStore';
import { SavedState } from '../localStorage';

const mockChangedStoredState: SavedState = {
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

const mockChangedState: OverallState = {
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
