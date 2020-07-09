import { screenSize } from '../commons/CommonConstants';
import { HexColor, Color } from '../utils/StyleUtils';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { alienLeagueFont, zektonFont } from '../commons/CommonFontAssets';
import { CollectibleProperty } from './GameCollectiblesTypes';
import { cookies } from '../commons/CommonAssets';

export const pageBannerYStartPos = -screenSize.y * 0.3;
export const pageBannerYSpacing = 150;
export const pageBannerTextXPos = screenSize.x * 0.3;

export const listBannerYStartPos = -screenSize.y * 0.31;
export const listBannerYSpacing = 100;
export const listBannerTextXPos = -screenSize.x * 0.09;

export const collectiblePreviewXPos = -screenSize.x * 0.3;
export const collectiblePreviewYPos = -screenSize.y * 0.05;
export const collectiblePreviewDim = 430;
export const collectibleTitleYOffset = -275;
export const collectibleDescYOffset = 275;

export const arrowDownYPos = screenSize.y * 0.34;
export const arrowXMidPos = screenSize.x * 0.08;
export const arrowXOffset = 80;
export const arrowXScale = 0.4;
export const arrowYScale = 0.3;

export const onHoverAlpha = 1.0;
export const offHoverAlpha = 0.7;

export const itemsPerPage = 7;

export const pageBannerTextStyle: BitmapFontStyle = {
  key: alienLeagueFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const listBannerTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 25,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

export const collectibleTitleStyle: BitmapFontStyle = {
  key: alienLeagueFont.key,
  size: 50,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const collectibleDescStyle = {
  fontFamily: 'Helvetica',
  fontSize: '25px',
  fill: Color.lightBlue,
  align: 'center',
  lineSpacing: 10,
  wordWrap: { width: 500 }
};

export const defaultCollectibleProp: CollectibleProperty = {
  assetKey: cookies.key,
  x: 0,
  y: 0
};
