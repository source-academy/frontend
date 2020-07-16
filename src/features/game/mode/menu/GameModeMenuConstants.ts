import FontAssets from '../../assets/FontAssets';
import ImageAssets from '../../assets/ImageAssets';
import { screenCenter, screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle, GameSprite } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const modeButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
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
  buttonYPosOffset: screenSize.y * 0.3,
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
