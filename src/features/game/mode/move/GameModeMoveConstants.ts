import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const moveButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const modeMoveConstants = {
  buttonYSpace: screenSize.y * 0.8,
  buttonXPosOffset: screenSize.x * 0.25,
  previewFrameXPos: screenSize.x * 0.3,
  previewWidth: screenSize.x * 0.473,
  previewHeight: screenSize.y * 0.56,
  previewXPos: screenSize.x * 0.3125,
  previewYPos: screenSize.y * 0.515
};

export default modeMoveConstants;
