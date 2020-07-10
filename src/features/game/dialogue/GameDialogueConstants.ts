import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

const dialogueRectMargin = 10;

const dialogueConstants = {
  promptSize: {
    x: 30,
    y: 60
  },
  promptPadding: {
    x: 30,
    y: 10
  },
  rect: {
    x: dialogueRectMargin,
    y: 760,
    width: screenSize.x - dialogueRectMargin * 2,
    height: 320
  },
  textPadding: {
    x: 100,
    y: 70
  }
};

export const textTypeWriterStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'left',
  lineSpacing: 10,
  wordWrap: {
    width:
      dialogueConstants.rect.width - dialogueConstants.textPadding.x * 2 - dialogueRectMargin * 2
  }
};

export default dialogueConstants;
