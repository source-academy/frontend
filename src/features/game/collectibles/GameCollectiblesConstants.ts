import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

export const bannerYStartPos = -screenSize.y * 0.3;
export const bannerXSpacing = 150;

export const bannerTextXPos = screenSize.x * 0.3;

export const bannerTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '30px',
  fill: Color.lightBlue
};
