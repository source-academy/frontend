import FontAssets from '../assets/FontAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Color } from '../utils/StyleUtils';

export const startPrompt = {
  text: 'Start the quiz?',
  options: ['Yes', 'No']
};

export const questionPrompt = 'What is the correct answer?';

export const QuizConstants = {
  textPad: 20,
  textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
  y: 100,
  width: 450,
  yInterval: 100,
  headerOff: 60,
  speakerTextConfig: { x: 320, y: 745, oriX: 0.5, oriY: 0.5 },
  optionsYOffSet: 75
};

export const quizTextStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.offWhite,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: QuizConstants.width - QuizConstants.textPad * 2 }
};

export const questionTextStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'left',
  lineSpacing: 10,
  wordWrap: { width: screenSize.x - 240 }
};

export const quizOptStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const speakerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 36,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
