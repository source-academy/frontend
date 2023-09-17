import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';

const charXOffset = 350;

const CharConstants = {
  charWidth: 600,
  charRect: {
    x: { Left: charXOffset, Middle: screenCenter.x, Right: screenSize.x - charXOffset }
  }
};

export default CharConstants;
