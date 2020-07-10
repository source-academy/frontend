import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { GameSprite, BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';
import ImageAssets from '../../assets/ImageAssets';

export const modeButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 45,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const modeBannerRect = {
  assetKey: ImageAssets.modeMenuBanner.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y,
  isInteractive: false
} as GameSprite;

const modeMenuConstants = {
  modeButtonYPos: screenSize.y * 0.8,
  entryTweenProps: {
    y: 0,
    duration: 500,
    ease: 'Power2'
  },
  exitTweenProps: {
    y: screenSize.y * 0.4,
    duration: 300,
    ease: 'Power2'
  }
};

export default modeMenuConstants;
