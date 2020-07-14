import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Color, HexColor } from '../utils/StyleUtils';
import { CollectibleProperty } from './GameCollectiblesTypes';

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

export const collectibleTitleStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 50,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const collectibleDescStyle = {
  fontFamily: 'Verdana',
  fontSize: '25px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10,
  wordWrap: { width: 500 }
};

export const defaultCollectibleProp: CollectibleProperty = {
  assetKey: ImageAssets.cookies.key,
  x: 0,
  y: 0
};

const CollectibleConstants = {
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

export default CollectibleConstants;
