import {
  OVERRIDE_DATES_KEY,
  OVERRIDE_KEY,
  OVERRIDE_PUBLISH_KEY,
  STORY_ID
} from './StorySimulatorTypes';
import { GameSessionOverride, StoryDetail } from './StorySimulatorTypes';
import { SESSION_DATA_KEY } from '../../pages/academy/game/legacy/backend/gameState';

/**
 * Fetches stories from Backend
 */
export async function fetchStories() {
  const stories = [
    { filename: 'mission-1', openAt: '', closeAt: '' },
    { filename: 'mission-1', openAt: '', closeAt: '' }
  ];
  return (stories as any) as StoryDetail[];
}

/**
 * Overrides game session
 */
export function overrideSessionData(data: GameSessionOverride) {
  if (!data) {
    removeSessionStorage();
  }
  sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data.sessionData));
  sessionStorage.setItem(OVERRIDE_KEY, 'true');
  if (data.overridePublish) {
    sessionStorage.setItem(OVERRIDE_PUBLISH_KEY, 'true');
  }
  if (data.overrideDates) {
    sessionStorage.setItem(OVERRIDE_DATES_KEY, 'true');
  }
}

/**
 * Clears game session
 */
function removeSessionStorage() {
  sessionStorage.removeItem(SESSION_DATA_KEY);
  sessionStorage.removeItem(OVERRIDE_KEY);
  sessionStorage.removeItem(OVERRIDE_PUBLISH_KEY);
  sessionStorage.removeItem(OVERRIDE_DATES_KEY);
}

export function setStoryId(storyId: string) {
  sessionStorage.setItem(STORY_ID, storyId);
}
