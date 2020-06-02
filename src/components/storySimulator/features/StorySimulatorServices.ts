import * as AWS from 'aws-sdk';

import { SESSION_DATA_KEY } from 'src/components/academy/game/backend/gameState';
import {
  accessKeyId,
  OVERRIDE_DATES_KEY,
  OVERRIDE_KEY,
  OVERRIDE_PUBLISH_KEY,
  region,
  s3Folder,
  secretAccessKey,
  STORY_ID
} from './StorySimulatorConstants';
import { GameSessionOverride, StoryDetail } from './StorySimulatorTypes';

AWS.config.update({ accessKeyId, secretAccessKey, region });
const s3 = new AWS.S3();

const params = {
  Bucket: 'source-academy-assets',
  Delimiter: '',
  Prefix: s3Folder
};

/**
 * Fetches stories from S3 Bucket
 */
export async function fetchStories() {
  const response = await s3.listObjects(params).promise();
  const stories = response.Contents || [];
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
