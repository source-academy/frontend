import FontAssets from '../assets/FontAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';

export const logTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const scrollbarX = screenSize.x * 0.251;
const scrollbarWidth = 7;

const LogConstants = {
  logTextConfig: { x: screenSize.x * -0.44, y: screenSize.y * -0.378, oriX: 0.0, oriY: 0.0 },
  textMaxWidth: screenSize.x * 0.68,
  logHeight: screenSize.y * 0.7632,
  scrollbarTrack: {
    x: scrollbarX,
    y: screenSize.y * 0.005,
    width: scrollbarWidth,
    height: screenSize.y * 0.73,
    color: 0x555555
  },
  scrollbarThumb: { x: scrollbarX, width: scrollbarWidth, color: 0x888888 },
  scrollSpeed: 0.5
};

export default LogConstants;
