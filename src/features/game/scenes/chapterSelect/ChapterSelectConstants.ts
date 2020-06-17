import { Color } from '../../utils/StyleUtils';
import { screenCenter, screenSize } from '../../commons/CommonConstants';

export const defaultScrollSpeed = 10;
export const scrollSpeedLimit = 100;
export const chapterButtonsYOffset = 200;
export const chapterButtonsXOffset = 100;
export const chapterFrameXOffset = 15;
export const chapterFrameYOffset = -10;
export const chapterTextYOffset = -125;

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

export const chapterSelectStyle = {
  fontFamily: 'Helvetica',
  fontSize: '36px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10
};
