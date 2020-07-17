import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { UserStateTypes } from '../state/GameStateTypes';
import { Color, HexColor } from '../utils/StyleUtils';
import { AwardProperty } from './GameAwardsTypes';

export const pageBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const listBannerTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const awardTitleStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 50,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const awardDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '25px',
  fill: Color.lightBlue,
  align: 'justify',
  lineSpacing: 10,
  wordWrap: { width: 500 }
};

export const defaultAwardProp: AwardProperty = {
  id: 'ult-cookie-award',
  assetKey: ImageAssets.cookies.key,
  assetPath: ImageAssets.cookies.path,
  title: 'Ultimate Cookie',
  description:
    'One Cookie to rule them all, One Cookie to find them, One Ring to bring them all, and in pantry bind them',
  awardType: UserStateTypes.collectibles
};

const AwardsConstants = {
  backButtonYPos: screenSize.y * 0.3,
  pageYStartPos: -screenSize.y * 0.3,
  pageYSpacing: 150,
  pageTextXPos: screenSize.x * 0.3,
  listYStartPos: -screenSize.y * 0.31,
  listYSpacing: 100,
  listTextXPos: -screenSize.x * 0.09,
  previewXPos: -screenSize.x * 0.3,
  previewYPos: -screenSize.y * 0.05,
  previewDim: 430,
  titleYOffset: -275,
  descYOffset: 275,
  arrowDownYPos: screenSize.y * 0.34,
  arrowXMidPos: screenSize.x * 0.08,
  arrowXOffset: 80,
  arrowXScale: 0.4,
  arrowYScale: 0.3,
  itemsPerPage: 7
};

export default AwardsConstants;
