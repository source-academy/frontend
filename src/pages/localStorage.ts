import { Chapter, Variant } from 'js-slang/dist/types';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

import { OverallState } from '../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../commons/application/types/ExternalTypes';
import { SessionState } from '../commons/application/types/SessionTypes';
import { showWarningMessage } from '../commons/utils/NotificationsHelper';
import { EditorTabState } from '../commons/workspace/WorkspaceTypes';
import { AchievementItem } from '../features/achievement/AchievementTypes';

// In JSON, missing keys & keys with the value 'null' are both
// deserialised into 'null'. In order to differentiate between
// the two cases, we wrap nullable values in an object. Missing
// keys would then be deserialised as 'null' while keys with
// the value 'null' would be deserialised as { value: null }.
export type NullableValue<T> = {
  value: T | null;
};

export type SavedState = {
  session: Partial<SessionState>;
  achievements: AchievementItem[];
  playgroundIsFolderModeEnabled: boolean;
  playgroundActiveEditorTabIndex: NullableValue<number>;
  playgroundEditorTabs: EditorTabState[];
  playgroundIsEditorAutorun: boolean;
  playgroundSourceChapter: Chapter;
  playgroundSourceVariant: Variant;
  playgroundExternalLibrary: ExternalLibraryName;
};

export const loadStoredState = (): SavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState');
    if (!serializedState) {
      return undefined;
    }
    const decompressed = decompressFromUTF16(serializedState);
    if (!decompressed) {
      return undefined;
    }
    return JSON.parse(decompressed) as SavedState;
  } catch (err) {
    showWarningMessage('Error loading from local storage');
    return undefined;
  }
};

export const saveState = (state: OverallState) => {
  try {
    const stateToBeSaved: SavedState = {
      session: {
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken,
        courseRegId: state.session.courseRegId,
        role: state.session.role,
        name: state.session.name,
        userId: state.session.userId,
        courses: state.session.courses,
        courseId: state.session.courseId,
        courseName: state.session.courseName,
        courseShortName: state.session.courseShortName,
        viewable: state.session.viewable,
        enableGame: state.session.enableGame,
        enableAchievements: state.session.enableAchievements,
        enableSourcecast: state.session.enableSourcecast,
        moduleHelpText: state.session.moduleHelpText,
        assetsPrefix: state.session.assetsPrefix,
        assessmentConfigurations: state.session.assessmentConfigurations,
        githubAccessToken: state.session.githubAccessToken
      },
      achievements: state.achievement.achievements,
      playgroundIsFolderModeEnabled: state.workspaces.playground.isFolderModeEnabled,
      playgroundActiveEditorTabIndex: {
        value: state.workspaces.playground.activeEditorTabIndex
      },
      playgroundEditorTabs: state.workspaces.playground.editorTabs,
      playgroundIsEditorAutorun: state.workspaces.playground.isEditorAutorun,
      playgroundSourceChapter: state.workspaces.playground.context.chapter,
      playgroundSourceVariant: state.workspaces.playground.context.variant,
      playgroundExternalLibrary: state.workspaces.playground.externalLibrary
    };
    const serialized = compressToUTF16(JSON.stringify(stateToBeSaved));
    localStorage.setItem('storedState', serialized);
  } catch (err) {
    showWarningMessage('Error saving to local storage');
  }
};
