import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

export const moveButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const MoveModeConstants = {
  button: { xOffSet: screenSize.x * 0.25, ySpace: screenSize.y * 0.8 },
  preview: {
    rect: {
      x: screenSize.x * 0.3125,
      y: screenSize.y * 0.515,
      width: screenSize.x * 0.473,
      height: screenSize.y * 0.56
    },
    frame: { x: screenSize.x * 0.3 }
  }
};

export default MoveModeConstants;
