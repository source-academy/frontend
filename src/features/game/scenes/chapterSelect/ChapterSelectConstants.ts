import { Color } from '../../utils/styles';
import { screenCenter, screenSize } from '../../commons/CommonConstants';

export const defaultScrollSpeed = 10;
export const marginX = 300;
export const marginY = 100;
export const blackTintAlpha = 0.8;

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
