import { HexColor } from '../../utils/StyleUtils';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import FontAssets from '../../assets/FontAssets';

export const chapterIndexStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.offWhite,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const chapterTitleStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const chapterActionAltStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const marginX = 0;
const marginY = 100;
const imageRectWidth = 500;

const chapConstants = {
  defaultScrollSpeed: 20,
  buttonsYOffset: 200,
  buttonsXOffset: 100,
  frameXOffset: 15,
  frameYOffset: -10,
  indexYOffset: -160,
  titleYOffset: -100,
  arrowXOffset: 875,
  offHoverAlpha: 0.7,
  onHoverAlpha: 1.0,
  maskRect: {
    x: -screenCenter.x + marginX,
    y: -screenCenter.y + marginY,
    width: screenSize.x - marginX * 2,
    height: screenSize.y - marginY * 2
  },
  imageRect: {
    width: imageRectWidth,
    height: 700
  },
  imageDist: imageRectWidth + 150
};

export default chapConstants;
