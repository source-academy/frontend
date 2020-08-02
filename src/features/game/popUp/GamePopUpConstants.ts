import { screenCenter, screenSize } from '../commons/CommonConstants';

const popUpXOffset = 400;

const PopUpConstants = {
  image: { xOffset: 20, yOffset: 20 },
  rect: {
    x: { Left: popUpXOffset, Middle: screenCenter.x, Right: screenSize.x - popUpXOffset },
    y: { Small: 325, Medium: 350, Large: 420 },
    scale: { Small: 0.7, Medium: 1, Large: 1.5 },
    width: 280,
    height: 280
  },
  tweenDuration: 300
};

export default PopUpConstants;
