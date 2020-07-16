import { screenCenter, screenSize } from '../commons/CommonConstants';

const popUpXOffset = 350;
const popUpYPos = screenCenter.y / 2;

const popUpConstants = {
  imgXOffset: 20,
  imgYOffset: 20,
  rect: {
    x: { Left: popUpXOffset, Middle: screenCenter.x, Right: screenSize.x - popUpXOffset },
    y: popUpYPos,
    width: 280,
    height: 280
  }
};

export default popUpConstants;
