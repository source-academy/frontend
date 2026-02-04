import { Variant } from 'js-slang/dist/types';
import { compressToUTF16 } from 'lz-string';

import {
  defaultLanguageConfig,
  defaultState,
  defaultStories,
  OverallState
} from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import Constants from '../../commons/utils/Constants';
import { createStore } from '../createStore';
import { SavedState } from '../localStorage';

const mockChangedStoredState: SavedState = {
  achievements: [],
  featureFlags: [],
  session: {
    accessToken: 'yep',
    refreshToken: 'refresherOrb',
    role: undefined,
    name: 'Jeff',
    userId: 1,
    githubAccessToken: 'githubAccessToken'
  },
  playgroundIsFolderModeEnabled: true,
  playgroundActiveEditorTabIndex: {
    value: 1
  },
  playgroundEditorTabs: [
    {
      filePath: '/playground/a.js',
      value: `import { square } from './b.js'; square(5);`,
      breakpoints: [],
      highlightedLines: []
    },
    {
      filePath: '/playground/b.js',
      value: 'export const square = x => x * x;',
      breakpoints: [],
      highlightedLines: []
    }
  ],
  playgroundIsEditorAutorun: true,
  playgroundSourceChapter: Constants.defaultSourceChapter,
  playgroundSourceVariant: Variant.DEFAULT,
  playgroundExternalLibrary: 'NONE' as ExternalLibraryName,
  playgroundLanguage: defaultLanguageConfig,
  stories: defaultStories
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
      isFolderModeEnabled: true,
      activeEditorTabIndex: 1,
      editorTabs: [
        {
          filePath: '/playground/a.js',
          value: `import { square } from './b.js'; square(5);`,
          breakpoints: [],
          highlightedLines: []
        },
        {
          filePath: '/playground/b.js',
          value: 'export const square = x => x * x;',
          breakpoints: [],
          highlightedLines: []
        }
      ],
      isEditorAutorun: true
    }
  }
};

describe('createStore() function', () => {
  test('has defaultState when initialised', () => {
    localStorage.removeItem('storedState');
    expect(createStore().getState()).toEqual(defaultState);
  });
  test('has correct getState() when called with storedState', () => {
    localStorage.setItem('storedState', compressToUTF16(JSON.stringify(mockChangedStoredState)));

    /**
     * Jest toEqual is unable to compare equality of functions (in the Octokit object).
     * Thus we simply check that it is defined when loading storedState.
     *
     * See https://github.com/facebook/jest/issues/8166
     */
    const received = createStore().getState() as any;
    const octokit = received.session.githubOctokitObject.octokit;
    delete received.session.githubOctokitObject.octokit;

    expect(received).toEqual(mockChangedState);
    expect(octokit).toBeDefined();
    localStorage.removeItem('storedState');
  });
});
