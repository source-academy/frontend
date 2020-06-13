import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/styles';

const dialogueRectMargin = 10;

export const dialogueRect = {
  x: dialogueRectMargin,
  y: 760,
  width: screenSize.x - dialogueRectMargin * 2,
  height: 320,
  assetKey: 'speechbox'
};

export const textPadding = {
  x: 60,
  y: 90
};

export const speakerRect = {
  x: 120,
  y: 100,
  width: 300,
  height: 100,
  assetKey: 'speechbox'
};

export const typeWriterTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: dialogueRect.width - textPadding.x * 2 - dialogueRectMargin * 2 }
};

export const speakerTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: dialogueRect.width - textPadding.x * 2 - dialogueRectMargin * 2 }
};
