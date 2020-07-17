import { AssetMap, ImageAsset } from './AssetsTypes';

const ImageAssets: AssetMap<ImageAsset> = {
  // Commons Asset
  shortButton: { key: 'short-button', path: '/ui/shortButton.png' },
  mediumButton: { key: 'med-button', path: '/ui/mediumButton.png' },
  longButton: { key: 'long-button', path: '/ui/longButton.png' },
  topButton: { key: 'top-button', path: '/ui/topButton.png' },
  speechBox: { key: 'speechBox', path: '/ui/speechbox.png' },
  speakerBox: { key: 'speakerBox', path: '/ui/speakerBox.png' },
  defaultLocationImg: { key: 'loc-default', path: '/ui/defaultLocation.jpg' },
  locationPreviewFrame: { key: 'loc-preview-frame', path: '/ui/locationPreviewFrame.png' },
  locationPreviewFill: { key: 'loc-preview-fill', path: '/ui/locationPreviewFill.png' },
  talkOptButton: { key: 'talk-opt-button', path: '/ui/talkOptButton.png' },
  talkOptCheck: { key: 'talk-opt-check', path: '/ui/talkOptCheck.png' },
  modeMenuBanner: { key: 'mode-banner', path: '/ui/modeMenuBanner.png' },
  popUpFrame: { key: 'pop-up-frame', path: '/ui/popUpFrame.png' },
  mediumBox: { key: 'medium-box', path: '/ui/mediumBox.png' },
  diamond: { key: 'diamond', path: '/ui/zircon.png' },
  arrow: { key: 'arrow', path: '/ui/arrow.png' },
  cookies: { key: 'cookies', path: '/images/cookies.png' },
  scrollFrame: { key: 'scroll-frame', path: '/ui/scrollFrame.png' },

  // Escape Menu
  escapeMenuBackground: { key: 'escape-bg', path: '/ui/escapeMenu.png' },

  // Awards Menu
  awardsMenu: { key: 'award-bg', path: '/ui/collectiblesBg.png' },
  awardsBanner: { key: 'award-banner', path: '/ui/collectiblesBanner.png' },
  awardsPageChosen: {
    key: 'award-pg-chosen',
    path: '/ui/collectiblesPageOptChosen.png'
  },
  awardsPage: { key: 'award-pg-opt', path: '/ui/collectiblesPageOpt.png' },

  // Chapter Select
  chapterSelectBackground: { key: 'chapter-select-bg', path: '/locations/yourRoom-dim/normal.png' },
  chapterRepeatButton: { key: 'chapter-repeat', path: '/ui/chapterRepeat.png' },
  chapterContinueButton: { key: 'chapter-continue', path: '/ui/chapterContinue.png' },
  chapterSelectFrame: { key: 'chapter-select-frame', path: '/ui/chapterSelectionFrame.png' },
  chapterSelectBorder: { key: 'chapter-select-border', path: '/ui/chapterSelectionBorder.png' },
  chapterSelectArrow: { key: 'chapter-select-arrow', path: '/ui/chapSelectArrow.png' },

  // Main Menu
  mainMenuBackground: { key: 'main-menu-bg', path: '/locations/yourRoom-dim/normal.png' },
  mainMenuOptBanner: { key: 'menu-option', path: '/ui/menuOption.png' },

  // Settings
  settingBackground: { key: 'setting-bg', path: '/locations/yourRoom-dim/normal.png' },
  settingBanner: { key: 'settings-bg', path: '/ui/settingsBg.png' },
  settingOption: { key: 'settings-opt', path: '/ui/settingsOption.png' },

  // Room Preview
  verifiedFrame: { key: 'verified-frame', path: '/ui/verifiedFrame.png' },

  // Bindings
  bindingsBackground: { key: 'setting-bg', path: '/locations/yourRoom-dim/normal.png' },
  squareKeyboardIcon: { key: 'keyboard-key-square', path: '/ui/keyboardKeyIcon.png' },
  medKeyboardIcon: { key: 'keyboard-key-medium', path: '/ui/TabIcon.png' }
};

export default ImageAssets;
