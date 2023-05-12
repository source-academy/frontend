import FontAssets from 'src/features/game/assets/FontAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

export const modeButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 45,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const MenuModeConstants = {
  button: { yOffset: screenSize.y * 0.3 },
  entryTweenProps: {
    y: 0,
    duration: 500,
    ease: 'Power2'
  },
  exitTweenProps: {
    y: screenSize.y * 0.4,
    duration: 300,
    ease: 'Power2'
  }
};

export default MenuModeConstants;
