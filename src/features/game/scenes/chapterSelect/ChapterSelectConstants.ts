import { HexColor } from '../../utils/StyleUtils';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';

export const defaultScrollSpeed = 20;
export const chapterButtonsYOffset = 200;
export const chapterButtonsXOffset = 100;
export const chapterFrameXOffset = 15;
export const chapterFrameYOffset = -10;
export const chapterIndexYOffset = -160;
export const chapterTitleYOffset = -100;
export const chapterArrowXOffset = 875;
export const offHoverAlpha = 0.7;
export const onHoverAlpha = 1.0;

const marginX = 0;
const marginY = 100;

export const maskRect = {
  x: -screenCenter.x + marginX,
  y: -screenCenter.y + marginY,
  width: screenSize.x - marginX * 2,
  height: screenSize.y - marginY * 2
};

export const imageRect = {
  width: 500,
  height: 700
};

export const imageDist = imageRect.width + 150;

export const chapterIndexStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 25,
  fill: HexColor.offWhite,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const chapterTitleStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const chapterActionAltStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
