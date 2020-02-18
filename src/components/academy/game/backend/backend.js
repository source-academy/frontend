const LIVE_ASSETS_HOST = 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/';

// placeholder URL
const TEST_ASSETS_HOST = 'https://localhost:8080/source-academy-assets/';

// placeholder predicate
export const ASSETS_HOST = true ? LIVE_ASSETS_HOST : TEST_ASSETS_HOST;