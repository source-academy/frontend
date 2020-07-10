import { screenSize, screenCenter } from '../../commons/CommonConstants';
import { GameSprite, BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';
import ImageAssets from '../../assets/ImageAssets';

export const moveButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const previewFill = {
  assetKey: ImageAssets.locationPreviewFill.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y
} as GameSprite;

export const previewFrame = {
  assetKey: ImageAssets.locationPreviewFrame.key,
  assetXPos: screenCenter.x,
  assetYPos: screenCenter.y
} as GameSprite;

const modeMoveConstants = {
  buttonYSpace: screenSize.y * 0.8,
  buttonXPos: screenSize.x * 0.75,
  previewFrameXPos: screenSize.x * 0.3,
  previewWidth: screenSize.x * 0.473,
  previewHeight: screenSize.y * 0.56,
  previewXPos: screenSize.x * 0.3125,
  previewYPos: screenSize.y * 0.515
};

export default modeMoveConstants;
