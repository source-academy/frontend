import { HexColor } from '../utils/StyleUtils';
import FontAssets from '../assets/FontAssets';

export const Constants = {
  repoAssetsFolder: '../assets',
  assetsFolder: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets',
  fadeDuration: 600,
  nullFunction: () => {},
  nullInteractionId: '',
  nullSequenceNumber: -1,
  popupDuration: 1000,
  defaultAssetPath: '/UI/wristDeviceButton.png',
  defaultFontStyle: {
    key: FontAssets.zektonFont.key,
    size: 30,
    fill: HexColor.lightBlue,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  }
};

export const screenSize = {
  x: 1920,
  y: 1080
};

export const screenCenter = {
  x: screenSize.x / 2,
  y: screenSize.y / 2
};
