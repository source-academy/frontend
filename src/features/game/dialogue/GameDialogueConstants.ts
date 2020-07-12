import { screenSize } from '../commons/CommonConstants';
import { Color, HexColor } from '../utils/StyleUtils';
import FontAssets from '../assets/FontAssets';
import { BitmapFontStyle } from '../commons/CommonTypes';

const dialogueRectMargin = 10;

const DialogueConstants = {
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
  },
  speakerRect: {
    x: 320,
    y: 745
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
      DialogueConstants.rect.width - DialogueConstants.textPadding.x * 2 - dialogueRectMargin * 2
  }
};

export const speakerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 36,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export default DialogueConstants;
