import FontAssets from '../../assets/FontAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { Color, HexColor } from '../../utils/StyleUtils';

export const AwardsHallConstants = {
  defaultScrollSpeed: 20,
  itemPerCol: 4,
  tileDim: 2048,
  maxAwardsPerCol: 2,
  awardsXSpacing: 300,
  arrowXOffset: 875,
  awardYStartPos: 300,
  awardYSpace: screenCenter.y - 50,
  awardDim: 200,
  hoverWidth: 300,
  bannerXOffset: -screenSize.x * 0.28,
  bannerTextConfig: { x: 30, y: 0, oriX: 0.0, oriY: 0.5 }
};

export const awardBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const awardNoAssetTitleStyle = {
  fontFamily: 'Verdana',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'center',
  wordWrap: { width: AwardsHallConstants.awardDim - 20 }
};

export const awardHoverTitleStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};

export const awardHoverKeyStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.offWhite,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};

export const awardHoverDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '15px',
  fill: Color.lightBlue,
  align: 'left',
  wordWrap: { width: AwardsHallConstants.hoverWidth - 20 }
};
