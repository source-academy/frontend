import { screenSize, screenCenter } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

export const charWidth = 700;
const charXOffset = 350;

export const charRect = {
  x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset },
  y: 800,
  height: screenSize.y * 0.4
};

export const speakerRect = {
  x: 330,
  y: 740
};

export const speakerTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '36px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10
};
