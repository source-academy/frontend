import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { GameSprite, BitmapFontStyle } from '../../commons/CommonTypes';
import { locationPreviewFill, locationPreviewFrame } from '../../commons/CommonAssets';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

export const moveButtonYSpace = screenSize.y * 0.8;
export const moveButtonXPos = screenSize.x * 0.75;
export const previewFrameXPos = screenSize.x * 0.3;
export const previewWidth = screenSize.x * 0.473;
export const previewHeight = screenSize.y * 0.56;
export const previewXPos = screenSize.x * 0.3125;
export const previewYPos = screenSize.y * 0.515;

export const moveButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
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
