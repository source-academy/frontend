import FontAssets from '../../assets/FontAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { Color } from '../../utils/StyleUtils';

export const AwardsHallConstants = {
  scrollSpeed: 20,
  tileDim: 2048,
  maxAwardsPerCol: 2,
  arrow: { xOffset: 875 },
  award: { xSpace: 300, yStart: 300, ySpace: screenCenter.y - 50, dim: 200 },
  awardInfo: { width: 300 },
  banner: { xOffset: -screenSize.x * 0.28 },
  bannerTextConfig: { x: 30, y: 0, oriX: 0.0, oriY: 0.5 }
};

export const awardBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const awardNoAssetTitleStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'center',
  wordWrap: { width: AwardsHallConstants.award.dim - 20 }
};

export const awardHoverTitleStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.awardInfo.width - 20 }
};

export const awardHoverKeyStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.offWhite,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.awardInfo.width - 20 }
};

export const awardHoverDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.awardInfo.width - 20 }
};
