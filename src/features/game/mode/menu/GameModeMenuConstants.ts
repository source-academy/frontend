import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { modeMenuBanner } from '../../commons/CommonAssets';
import { GameSprite } from '../../commons/CommonTypes';

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

export const modeButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '45px',
  fill: '#abd4c6'
};

export const modeBannerRect = {
  assetKey: modeMenuBanner.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y,
  isInteractive: false
} as GameSprite;
