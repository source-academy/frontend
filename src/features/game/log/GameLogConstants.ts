import FontAssets from '../assets/FontAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';

export const logTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const LogConstants = {
  logTextConfig: { x: screenSize.x * 0.06, oriX: 0.0, oriY: 0.5 },
  scrollSpeed: 0.5
};

export default LogConstants;
