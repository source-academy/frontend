import FontAssets from '../assets/FontAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';

export const pageBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const DashboardConstants = {
  backButton: { y: screenSize.y * 0.3 },
  page: { yStart: -screenSize.y * 0.3, ySpace: 150 },
  pageTextConfig: { x: screenSize.x * 0.3, y: 0, oriX: 0.1, oriY: 0.5 }
};

export default DashboardConstants;
