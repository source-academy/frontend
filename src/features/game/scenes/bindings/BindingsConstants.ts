import FontAssets from '../../assets/FontAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

export const BindingConstants = {
  keyTextConfig: { x: screenCenter.x - 100, y: 0, oriX: 0.5, oriY: 0.5 },
  keyDescTextConfig: { x: screenCenter.x + 100, y: 0, oriX: 0.5, oriY: 0.5 },
  key: {
    xOffset: screenSize.x / 5,
    yOffset1: screenCenter.y - screenSize.y / 4,
    yOffset2: screenCenter.y - screenSize.y / 1.5,
    yInterval: 150
  },
  icon: { x: screenCenter.x - 100 }
};

export const keyStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const keyDescStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
