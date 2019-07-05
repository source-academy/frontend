import { compressToUTF16 } from 'lz-string';
import { ISavedState, loadStoredState, saveState } from './localStorage';
import { defaultState } from './reducers/states';

const mockShortDefaultState: ISavedState = {
  session: {
    accessToken: defaultState.session.accessToken,
    refreshToken: defaultState.session.refreshToken,
    role: defaultState.session.role,
    name: defaultState.session.name
  },
  playgroundEditorValue: defaultState.workspaces.playground.editorValue,
  playgroundIsEditorAutorun: defaultState.workspaces.playground.isEditorAutorun
};

describe('loadStoredState() function', () => {
  test('runs normally', () => {
    localStorage.setItem('storedState', compressToUTF16(JSON.stringify(mockShortDefaultState)));
    expect(loadStoredState()).toEqual(mockShortDefaultState);
    localStorage.removeItem('storedState');
  });
  test('returns undefined when there is no stored state', () => {
    localStorage.removeItem('storedState');
    expect(loadStoredState()).toBe(undefined);
  });
});

describe('saveState() function', () => {
  test('Runs normally', () => {
    saveState(defaultState);
    expect(localStorage.getItem('storedState')).toBe(
      compressToUTF16(JSON.stringify(mockShortDefaultState))
    );
    localStorage.removeItem('storedState');
  });
});
