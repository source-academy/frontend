import { AssetMap, AssetType, ImageAsset } from './AssetsTypes';

const ImageAssets: AssetMap<ImageAsset> = {
  // Commons Asset
  spaceshipBg: {
    type: AssetType.Image,
    key: 'spaceship-bg',
    path: '/locations/spaceshipBackground.png'
  },
  saBanner: { type: AssetType.Image, key: 'sa-banner', path: '/ui/sourceAcadBannerOneLine.png' },
  shortButton: { type: AssetType.Image, key: 'short-button', path: '/ui/shortButton.png' },
  mediumButton: { type: AssetType.Image, key: 'med-button', path: '/ui/mediumButton.png' },
  longButton: { type: AssetType.Image, key: 'long-button', path: '/ui/longButton.png' },
  topButton: { type: AssetType.Image, key: 'top-button', path: '/ui/topButton.png' },
  speechBox: { type: AssetType.Image, key: 'speechBox', path: '/ui/speechbox.png' },
  speakerBox: { type: AssetType.Image, key: 'speakerBox', path: '/ui/speakerBox.png' },
  defaultLocationImg: {
    type: AssetType.Image,
    key: 'loc-default',
    path: '/ui/defaultLocation.jpg'
  },
  locationPreviewFrame: {
    type: AssetType.Image,
    key: 'loc-preview-frame',
    path: '/ui/locationPreviewFrame.png'
  },
  locationPreviewFill: {
    type: AssetType.Image,
    key: 'loc-preview-fill',
    path: '/ui/locationPreviewFill.png'
  },
  talkOptButton: { type: AssetType.Image, key: 'talk-opt-button', path: '/ui/talkOptButton.png' },
  talkOptCheck: { type: AssetType.Image, key: 'talk-opt-check', path: '/ui/talkOptCheck.png' },
  modeMenuBanner: { type: AssetType.Image, key: 'mode-banner', path: '/ui/modeMenuBanner.png' },
  popUpFrame: { type: AssetType.Image, key: 'pop-up-frame', path: '/ui/popUpFrame.png' },
  mediumBox: { type: AssetType.Image, key: 'medium-box', path: '/ui/mediumBox.png' },
  diamond: { type: AssetType.Image, key: 'diamond', path: '/ui/zircon.png' },
  arrow: { type: AssetType.Image, key: 'arrow', path: '/ui/arrow.png' },
  cookies: { type: AssetType.Image, key: 'cookies', path: '/images/cookies.png' },
  scrollFrame: { type: AssetType.Image, key: 'scroll-frame', path: '/ui/scrollFrame.png' },
  messageBar: { type: AssetType.Image, key: 'message-bar', path: '/ui/messageBg.png' },

  // Escape Menu
  escapeMenuBackground: { type: AssetType.Image, key: 'escape-bg', path: '/ui/escapeMenu.png' },

  // Awards Menu
  awardsMenu: { type: AssetType.Image, key: 'award-bg', path: '/ui/collectiblesBg.png' },
  awardsBanner: { type: AssetType.Image, key: 'award-banner', path: '/ui/awardsBanner.png' },
  awardsPageChosen: {
    type: AssetType.Image,
    key: 'award-pg-chosen',
    path: '/ui/collectiblesPageOptChosen.png'
  },
  awardsPage: { type: AssetType.Image, key: 'award-pg-opt', path: '/ui/collectiblesPageOpt.png' },

  // Awards Hall
  awardsBackground: { type: AssetType.Image, key: 'award-hall-bg', path: '/ui/awardsHall.png' },

  // Toolbar
  gear: { type: AssetType.Image, key: 'gear', path: '/ui/settings.png' },
  journal: { type: AssetType.Image, key: 'journal', path: '/ui/journal.png' },

  // Chapter Select
  chapterRepeatButton: {
    type: AssetType.Image,
    key: 'chapter-repeat',
    path: '/ui/chapterRepeat.png'
  },
  chapterContinueButton: {
    type: AssetType.Image,
    key: 'chapter-continue',
    path: '/ui/chapterContinue.png'
  },
  StarGold: {
    type: AssetType.Image,
    key: 'StarGold',
    path: '/ui/StarGold.png'
  },
  StarSilver: {
    type: AssetType.Image,
    key: 'StarSilver',
    path: '/ui/StarSilver.png'
  },
  StarBronze: {
    type: AssetType.Image,
    key: 'StarBronze',
    path: '/ui/StarBronze.png'
  },
  chapterSelectFrame: {
    type: AssetType.Image,
    key: 'chapter-select-frame',
    path: '/ui/chapterSelectionFrame.png'
  },
  chapterSelectBorder: {
    type: AssetType.Image,
    key: 'chapter-select-border',
    path: '/ui/chapterSelectionBorder.png'
  },
  chapterSelectArrow: {
    type: AssetType.Image,
    key: 'chapter-select-arrow',
    path: '/ui/chapSelectArrow.png'
  },

  // Main Menu
  mainMenuOptBanner: { type: AssetType.Image, key: 'menu-option', path: '/ui/menuOption.png' },

  // Settings
  settingBanner: { type: AssetType.Image, key: 'settings-bg', path: '/ui/settingsBg.png' },
  settingOption: { type: AssetType.Image, key: 'settings-opt', path: '/ui/settingsOption.png' },

  // Room Preview
  verifiedFrame: { type: AssetType.Image, key: 'verified-frame', path: '/ui/verifiedFrame.png' },
  sourceCrashedPod: {
    type: AssetType.Image,
    key: 'source-crashed-pod',
    path: '/locations/sourceCrashedPod.png'
  },

  // Bindings
  squareKeyboardIcon: {
    type: AssetType.Image,
    key: 'keyboard-key-square',
    path: '/ui/keyboardKeyIcon.png'
  },
  medKeyboardIcon: { type: AssetType.Image, key: 'keyboard-key-medium', path: '/ui/TabIcon.png' }
};

export default ImageAssets;
