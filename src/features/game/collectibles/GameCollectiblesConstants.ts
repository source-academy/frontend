import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

export const pageBannerYStartPos = -screenSize.y * 0.3;
export const pageBannerYSpacing = 150;
export const pageBannerTextXPos = screenSize.x * 0.3;

export const listBannerYStartPos = -screenSize.y * 0.31;
export const listBannerYSpacing = 100;
export const listBannerTextXPos = -screenSize.x * 0.09;

export const arrowDownYPos = screenSize.y * 0.34;
export const arrowXMidPos = screenSize.x * 0.08;
export const arrowXOffset = 80;
export const arrowXScale = 0.4;
export const arrowYScale = 0.3;

export const onHoverAlpha = 1.0;
export const offHoverAlpha = 0.7;

export const itemsPerPage = 7;

export const pageBannerTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '30px',
  fill: Color.lightBlue
};

export const listBannerTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.darkBlue
};
