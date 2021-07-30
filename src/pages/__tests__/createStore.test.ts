import { Variant } from 'js-slang/dist/types';
import { compressToUTF16 } from 'lz-string';

import { defaultState, OverallState } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import Constants from '../../commons/utils/Constants';
import { history } from '../../commons/utils/HistoryHelper';
import { createStore } from '../createStore';
import { SavedState } from '../localStorage';

const mockChangedStoredState: SavedState = {
  achievements: [],
  session: {
    accessToken: 'yep',
    refreshToken: 'refresherOrb',
    role: undefined,
    name: 'Jeff',
    userId: 1,
    githubAccessToken: 'githubAccessToken'
  },
  playgroundEditorValue: 'Nihao everybody',
  playgroundIsEditorAutorun: true,
  playgroundSourceChapter: Constants.defaultSourceChapter,
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
    name: 'Jeff',
    userId: 1,
    githubAccessToken: 'githubAccessToken'
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

    /**
     * Jest toEqual is unable to compare equality of functions (in the Octokit object).
     * Thus we simply check that it is defined when loading storedState.
     *
     * See https://github.com/facebook/jest/issues/8166
     */
    const received = createStore(history).getState() as any;
    const octokit = received.session.githubOctokitObject.octokit;
    delete received.session.githubOctokitObject.octokit;

    expect(received).toEqual({
      ...mockChangedState,
      router: defaultRouter
    });
    expect(octokit).toBeDefined();
    localStorage.removeItem('storedState');
  });
});
