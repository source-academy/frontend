import FontAssets from '../../assets/FontAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

export const chapterIndexStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const chapterTitleStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const pageNumberStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

// These are the original chapter preview image and frame dimensions
const originalImageRectWidth = 500;
const originalImageRectHeight = 700;
// Use these to change the size of each chapter's image and frame
const imageScaleX = 0.8;
const imageScaleY = 0.4;

const chapPerRow = 3;
const chapPerCol = 3;

const chapConstants = {
  arrow: { xOffset: 875 },
  buttons: { scale: 0.65 },
  resetButton: { xOffset: 135, yOffset: 85 },
  playButton: { xOffset: 55, yOffset: 85 },
  frame: { xOffset: 15 * imageScaleX, yOffset: -10 * imageScaleY },
  scrollSpeed: 100,
  indexTextConfig: { x: 0, y: -110, oriX: 0.5, oriY: 0.5 },
  titleTextConfig: { x: 0, y: -50, oriX: 0.5, oriY: 0.5 },
  pageNumberTextConfig: { x: screenCenter.x, y: screenSize.y - 30, oriX: 0.5, oriY: 0.5 },
  imageRect: {
    width: originalImageRectWidth * imageScaleX,
    height: originalImageRectHeight * imageScaleY
  },
  imageScale: {
    x: imageScaleX,
    y: imageScaleY
  },
  chapComplete: {
    y: 10,
    height: 30,
    text: 'Chapter Completed'
  },
  grid: {
    chapPerRow,
    chapPerCol,
    chapPerPage: chapPerRow * chapPerCol,
    chapGapX: 50,
    chapGapY: 50
  }
};

export default chapConstants;
