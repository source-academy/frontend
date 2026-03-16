import { compressToUTF16 } from 'lz-string';

import { defaultState } from '../../commons/application/ApplicationTypes';
import { loadStoredState, SavedState, saveState } from '../localStorage';

const mockShortDefaultState: SavedState = {
  session: {
    accessToken: defaultState.session.accessToken,
    refreshToken: defaultState.session.refreshToken,
    courseRegId: defaultState.session.courseRegId,
    role: defaultState.session.role,
    group: defaultState.session.group,
    name: defaultState.session.name,
    userId: defaultState.session.userId,
    courses: defaultState.session.courses,
    courseId: defaultState.session.courseId,
    courseName: defaultState.session.courseName,
    courseShortName: defaultState.session.courseShortName,
    viewable: defaultState.session.viewable,
    enableGame: defaultState.session.enableGame,
    enableAchievements: defaultState.session.enableAchievements,
    enableOverallLeaderboard: defaultState.session.enableOverallLeaderboard,
    enableContestLeaderboard: defaultState.session.enableContestLeaderboard,
    enableSourcecast: defaultState.session.enableSourcecast,
    enableStories: defaultState.session.enableStories,
    moduleHelpText: defaultState.session.moduleHelpText,
    assetsPrefix: defaultState.session.assetsPrefix,
    assessmentConfigurations: defaultState.session.assessmentConfigurations
  },
  achievements: defaultState.achievement.achievements,
  featureFlags: defaultState.featureFlags.modifiedFlags,
  playgroundIsFolderModeEnabled: defaultState.workspaces.playground.isFolderModeEnabled,
  playgroundActiveEditorTabIndex: {
    value: defaultState.workspaces.playground.activeEditorTabIndex
  },
  playgroundEditorTabs: defaultState.workspaces.playground.editorTabs,
  playgroundIsEditorAutorun: defaultState.workspaces.playground.isEditorAutorun,
  playgroundSourceChapter: defaultState.workspaces.playground.context.chapter,
  playgroundSourceVariant: defaultState.workspaces.playground.context.variant,
  playgroundLanguage: defaultState.playground.languageConfig,
  playgroundExternalLibrary: defaultState.workspaces.playground.externalLibrary,
  stories: {
    userId: defaultState.stories.userId,
    groupId: defaultState.stories.groupId,
    role: defaultState.stories.role
  }
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
