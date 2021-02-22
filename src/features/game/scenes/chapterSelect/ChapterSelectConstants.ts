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
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const marginX = 0;
const marginY = 100;
const imageRectWidth = 500;

const chapConstants = {
  arrow: { xOffset: 875 },
  button: { xOffset: 100, yOffset: 200 },
  frame: { xOffset: 15, yOffset: -10 },
  scrollSpeed: 20,
  indexTextConfig: { x: 0, y: -160, oriX: 0.5, oriY: 0.5 },
  titleTextConfig: { x: 0, y: -100, oriX: 0.5, oriY: 0.5 },
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
  imageDist: imageRectWidth + 150,
  chapComplete: {
    y: 20,
    height: 60,
    text: 'Chapter Completed'
  }
};

export default chapConstants;
