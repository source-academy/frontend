import { screenSize, screenCenter } from '../commons/CommonConstants';

const charXOffset = 350;

export const charRect = {
  x: { left: charXOffset, middle: screenCenter.x, right: screenSize.x - charXOffset },
  y: 800,
  height: screenSize.y * 0.4
};
