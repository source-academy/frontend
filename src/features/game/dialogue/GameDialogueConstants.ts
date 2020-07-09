import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

const dialogueRectMargin = 10;

export const diamondSize = {
  x: 30,
  y: 60
};

export const diamondPadding = {
  x: 30,
  y: 10
};

export const dialogueRect = {
  x: dialogueRectMargin,
  y: 760,
  width: screenSize.x - dialogueRectMargin * 2,
  height: 320,
  assetKey: 'speechbox'
};

export const textPadding = {
  x: 100,
  y: 70
};

export const textTypeWriterStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: dialogueRect.width - textPadding.x * 2 - dialogueRectMargin * 2 }
};
