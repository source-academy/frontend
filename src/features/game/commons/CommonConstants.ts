import UtilConstants, { Links } from 'src/commons/utils/Constants';

import FontAssets from '../assets/FontAssets';

export const Constants = {
  assetsFolder: Links.sourceAcademyAssets,
  useEmptyAssetPrefix: UtilConstants.useEmptyAssetPrefix,
  fadeDuration: 600,
  nullFunction: () => {},
  nullInteractionId: '',
  nullSequenceNumber: -1,
  popUpDuration: 1000,
  defaultAssetPath: '/ui/wristDeviceButton.png',
  defaultFontStyle: {
    key: FontAssets.zektonFont.key,
    size: 30,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  },
  defaultCursor: ''
};

export const screenSize = {
  x: 1920,
  y: 1080
};

export const screenCenter = {
  x: screenSize.x / 2,
  y: screenSize.y / 2
};
