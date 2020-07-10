import { screenSize, screenCenter } from '../commons/CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { zektonFont } from '../commons/CommonFontAssets';

export const speakerTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 36,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const charXOffset = 350;

const CharConstants = {
  charWidth: 700,
  charRect: {
    x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset },
    y: 800,
    height: screenSize.y * 0.4
  },
  speakerRect: {
    x: 320,
    y: 745
  }
};

export default CharConstants;
