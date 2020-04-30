import { compressToUTF16 } from 'lz-string';
import { createStore } from './createStore';
import { ISavedState } from './localStorage';
import { defaultState, IState } from './reducers/states';
import { history } from './utils/history';

const mockChangedStoredState: ISavedState = {
  session: {
    accessToken: 'yep',
    refreshToken: 'refresherOrb',
    role: undefined,
    name: 'Jeff'
  },
  playgroundEditorValue: 'Nihao everybody',
  playgroundIsEditorAutorun: true
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

describe('createStore() function', () => {
  test('has defaultState when initialised', () => {
    localStorage.removeItem('storedState');
    expect(createStore(history).getState()).toEqual({
      ...defaultState,
      router: { location: null }
    });
  });
  test('has correct getState() when called with storedState', () => {
    localStorage.setItem('storedState', compressToUTF16(JSON.stringify(mockChangedStoredState)));
    expect(createStore(history).getState()).toEqual({
      ...mockChangedState,
      router: { location: null }
    });
    localStorage.removeItem('storedState');
  });
});
