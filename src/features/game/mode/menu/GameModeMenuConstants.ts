import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { modeMenuBanner } from '../../commons/CommonAssets';
import { GameSprite, BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

export const modeButtonYPos = screenSize.y * 0.8;

export const menuEntryTweenProps = {
  y: 0,
  duration: 500,
  ease: 'Power2'
};

export const menuExitTweenProps = {
  y: screenSize.y * 0.4,
  duration: 300,
  ease: 'Power2'
};

export const modeButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 45,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const modeBannerRect = {
  assetKey: modeMenuBanner.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y,
  isInteractive: false
} as GameSprite;
