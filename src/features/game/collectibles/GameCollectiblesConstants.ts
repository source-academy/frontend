import { screenSize } from '../commons/CommonConstants';
import { Color } from '../utils/StyleUtils';

export const pageBannerYStartPos = -screenSize.y * 0.3;
export const pageBannerYSpacing = 150;
export const pageBannerTextXPos = screenSize.x * 0.3;

export const listBannerYStartPos = -screenSize.y * 0.31;
export const listBannerYSpacing = 100;
export const listBannerTextXPos = -screenSize.x * 0.09;

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
