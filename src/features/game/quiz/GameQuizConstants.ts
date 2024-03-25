import { DialogueLine, DialogueObject } from "../dialogue/GameDialogueTypes";
import FontAssets from '../assets/FontAssets';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Color } from '../utils/StyleUtils';

export const defaultReaction = {
  correct: ['You are right.'],
  wrong: ['Wrong answer...']
};

const resultLine : DialogueLine = {
  line : "good job",
}

const resultLine2 : DialogueLine = {
  line : "Need improvement. Some questions are wrong. ",
}

export const allCorrect : DialogueObject = new Map([
  ["all correct", [resultLine]]
]); 

export const ImproveMent : DialogueObject = new Map([
  ["improvement", [resultLine2]]
]);

export const QuizConstants = {
    textPad: 20,
    textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
    y: 100,
    width: 450,
    yInterval: 100
};
  
export const  textStyle = {
    fontFamily: 'Verdana',
    fontSize: '20px',
    fill: Color.offWhite,
    align: 'right',
    lineSpacing: 10,
    wordWrap: { width: QuizConstants.width - QuizConstants.textPad * 2 }
  };
  
export const quizOptStyle: BitmapFontStyle = {
    key: FontAssets.zektonFont.key,
    size: 25,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  };