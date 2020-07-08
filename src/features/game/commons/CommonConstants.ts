import { zektonFont } from './CommonFontAssets';
import { HexColor } from '../utils/StyleUtils';

export const Constants = {
  repoAssetsFolder: '../assets',
  assetsFolder: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets',
  fadeDuration: 600,
  nullFunction: () => {},
  nullInteractionId: '',
  popupDuration: 1000,
  defaultAssetPath: '/UI/wristDeviceButton.png',
  defaultFontStyle: {
    key: zektonFont.key,
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
