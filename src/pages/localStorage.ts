import { Variant } from 'js-slang/dist/types';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

import { OverallState } from '../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../commons/application/types/ExternalTypes';
import { SessionState } from '../commons/application/types/SessionTypes';
import { showWarningMessage } from '../commons/utils/NotificationsHelper';
import { AchievementItem } from '../features/achievement/AchievementTypes';

export type SavedState = {
  session: Partial<SessionState>;
  achievements: AchievementItem[];
  playgroundEditorValue: string | null;
  playgroundIsEditorAutorun: boolean;
  playgroundSourceChapter: number;
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
        role: state.session.role,
        name: state.session.name,
        userId: state.session.userId,
        githubAccessToken: state.session.githubAccessToken
      },
      achievements: state.achievement.achievements,
      playgroundEditorValue: state.workspaces.playground.editorValue,
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
