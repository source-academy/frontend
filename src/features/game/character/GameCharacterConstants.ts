import { screenSize, screenCenter } from '../commons/CommonConstants';

export const charWidth = 900;
const charXOffset = 350;

export const charRect = {
  x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset },
  y: 800,
  height: screenSize.y * 0.4
};

export enum CharacterPosition {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right'
}
