import FontAssets from '../assets/FontAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';

export const headerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 50,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const logTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const LogConstants = {
  headerTextConfig: { x: screenSize.x * 0.44, y: screenCenter.y * 0.25, oriX: 0.0, oriY: 0.5 }
};

export default LogConstants;
