import { screenSize, screenCenter } from '../commons/CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { zektonFont } from '../commons/CommonFontAssets';

export const charWidth = 700;
const charXOffset = 350;

export const charRect = {
  x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset },
  y: 800,
  height: screenSize.y * 0.4
};

export const speakerRect = {
  x: 320,
  y: 745
};

export const speakerTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 36,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
