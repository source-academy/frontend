import FontAssets from '../assets/FontAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
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

export const awardKeyStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.offWhite,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const awardDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '20px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10,
  wordWrap: { width: 500 }
};

export const defaultAwardProp: AwardProperty = {
  id: 'default-award',
  assetKey: Constants.nullInteractionId,
  assetPath: Constants.nullInteractionId,
  title: '',
  description: 'There is no asset associated with this award.'
};

const previewXPos = -screenSize.x * 0.3;
const previewYPos = -screenSize.y * 0.05;

const AwardsConstants = {
  backButtonYPos: screenSize.y * 0.3,
  pageYStartPos: -screenSize.y * 0.3,
  pageYSpacing: 150,
  pageTextXPos: screenSize.x * 0.3,
  listYStartPos: -screenSize.y * 0.31,
  listYSpacing: 100,
  listTextXPos: -screenSize.x * 0.09,
  previewXPos: previewXPos,
  previewYPos: previewYPos,
  previewDim: 430,
  noPreviewTextConfig: { x: previewXPos, y: -40, oriX: 0.35, oriY: 0.5 },
  previewTitleTextConfig: { x: previewXPos, y: previewYPos - 275, oriX: 0.15, oriY: 0.5 },
  previewKeyTextConfig: { x: previewXPos, y: previewYPos + 275, oriX: 0.4, oriY: 0.5 },
  previewDescTextYOffset: 310,
  arrowDownYPos: screenSize.y * 0.34,
  arrowXMidPos: screenSize.x * 0.08,
  arrowXOffset: 80,
  arrowXScale: 0.4,
  arrowYScale: 0.3,
  itemsPerPage: 7
};

export default AwardsConstants;
