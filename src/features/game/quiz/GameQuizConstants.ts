import { Color } from '../utils/StyleUtils';

export const QuizConstants = {
  textPad: 20,
  textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
  y: 100,
  width: 450,
  yInterval: 100
}

export const textStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.offWhite,
  align: 'right',
  lineSpacing: 10,
  wordWrap: { width: QuizConstants.width - QuizConstants.textPad * 2 }
};
