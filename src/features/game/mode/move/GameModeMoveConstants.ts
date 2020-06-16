import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { GameSprite } from '../../commons/CommonsTypes';
import { locationPreviewFill, locationPreviewFrame } from '../../commons/CommonAssets';

export const moveButtonYSpace = screenSize.y * 0.8;
export const moveButtonXPos = screenSize.x * 0.75;
export const previewFrameXPos = screenSize.x * 0.3;
export const previewWidth = screenSize.x * 0.473;
export const previewHeight = screenSize.y * 0.56;
export const previewXPos = screenSize.x * 0.3125;
export const previewYPos = screenSize.y * 0.515;

export const moveButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '35px',
  fill: '#abd4c6'
};

export const previewFill = {
  assetKey: locationPreviewFill.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y
} as GameSprite;

export const previewFrame = {
  assetKey: locationPreviewFrame.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y
} as GameSprite;
