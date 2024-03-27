import FontAssets from '../assets/FontAssets';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Color } from '../utils/StyleUtils';

const allCorrect : string = "Well done!";

const notAllCorrect : string = "Let's keep going!"

export const resultMsg = {
  allCorrect: allCorrect,
  notAllCorrect: notAllCorrect
}

export const QuizConstants = {
    textPad: 10,
    textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
    y: 100,
    width: 450,
    yInterval: 100
};
  
export const textStyle = {
    fontFamily: 'Verdana',
    fontSize: '20px',
    fill: Color.offWhite,
    align: 'right',
    lineSpacing: 10,
    wordWrap: { width: QuizConstants.width - QuizConstants.textPad * 2 }
  };

export const questionTextStyle = {
    fontFamily: 'Verdana',
    fontSize: '30px',
    fill: Color.lightBlue,
    align: 'left',
    lineSpacing: 10,
    wordWrap: { width: QuizConstants.width - QuizConstants.textPad * 2 }
  };
  
export const quizOptStyle: BitmapFontStyle = {
    key: FontAssets.zektonFont.key,
    size: 25,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  };