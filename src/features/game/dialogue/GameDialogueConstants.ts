import FontAssets from 'src/features/game/assets/FontAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { Color } from 'src/features/game/utils/StyleUtils';

const dialogueRectMargin = 10;

const DialogueConstants = {
  prompt: { x: 30, y: 60, xPad: 30, yPad: 10 },
  rect: {
    x: dialogueRectMargin,
    y: 760,
    width: screenSize.x - dialogueRectMargin * 2
  },
  text: { xPad: 100, yPad: 70 },
  speakerTextConfig: { x: 320, y: 745, oriX: 0.5, oriY: 0.5 }
};

export const textTypeWriterStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'left',
  lineSpacing: 10,
  wordWrap: {
    width:
      DialogueConstants.rect.width - DialogueConstants.text.xPad * 2 - DialogueConstants.rect.x * 2
  }
};

export const speakerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 36,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export default DialogueConstants;
