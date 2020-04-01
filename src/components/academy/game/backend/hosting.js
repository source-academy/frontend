import { isStudent } from './user';

const LIVE_ASSETS_HOST = 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/';

const LIVE_STORIES_HOST = 'https://s3-ap-southeast-1.amazonaws.com/test-gamedev-bucket/';
// placeholder URL
// const TEST_ASSETS_HOST = 'https://localhost:8080/source-academy-assets/';
const TEST_STORIES_HOST = 'https://s3-ap-southeast-1.amazonaws.com/test-gamedev-bucket/testing-stories/';

// placeholder predicate
export const ASSETS_HOST = LIVE_ASSETS_HOST;
export const STORY_HOST = isStudent() ? LIVE_STORIES_HOST : TEST_STORIES_HOST;