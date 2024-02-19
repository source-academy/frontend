import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

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

export const MenuLineConstants = {
  x: 0,
  y: 15,
  lineLength: 20,
  lineWidth: 4,
  exploreOffset: -68,
  moveOffset: 20,
  talkOffset: -30,
  yOffset: 20,
  color: 0xbce7da
};
