import { screenCenter, screenSize } from '../commons/CommonConstants';

const popUpXOffset = 350;
const popUpYPos = screenCenter.y / 2;

export const popUpPos = {
  x: { Left: popUpXOffset, Middle: screenCenter.x, Right: screenSize.x - popUpXOffset },
  y: popUpYPos
};
