import { screenSize, screenCenter } from '../commons/CommonConstants';
import { Color } from '../utils/styles';

export const charWidth = 700;
const charXOffset = 350;

export const charRect = {
  x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset },
  y: 800,
  height: screenSize.y * 0.4
};

export const textPadding = 10;

export const speakerRect = {
  x: 220,
  y: 750,
  width: 300,
  height: 50
};

export const speakerTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10
};
