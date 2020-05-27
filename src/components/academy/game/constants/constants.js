import { ASSETS_HOST, LIVE_STORIES_HOST, TEST_STORIES_HOST } from '../backend/hosting';

const Constants = {
  screenWidth: 1920,
  screenHeight: 1080,
  dialogBoxHeight: 260,
  dialogBoxWidth: 1720,
  dialogBoxPadding: 25,
  fontSize: 44,
  innerDialogPadding: 46,
  avatarOffset: 46,
  nameBoxXPadding: 50,
  nameBoxHeight: 80,
  playerAvatarSize: 300,
  playerAvatarLineWidth: 10,
  playerAvatarOffset: 40,
  glowDistance: 30,
  textSpeed: 0.002,
  storyXMLPathLive: LIVE_STORIES_HOST,
  storyXMLPathTest: TEST_STORIES_HOST,
  locationPath: ASSETS_HOST + 'locations/',
  objectPath: ASSETS_HOST + 'objects/',
  imgPath: ASSETS_HOST + 'images/',
  avatarPath: ASSETS_HOST + 'avatars/',
  uiPath: ASSETS_HOST + 'UI/',
  soundPath: ASSETS_HOST + 'sounds/',
  SAVE_DATA_KEY: 'source_academy_save_data',
  LOCATION_KEY: 'source_academy_location',
  fadeTime: 0.3,
  nullFunction: () => {}
};
export default Constants;
