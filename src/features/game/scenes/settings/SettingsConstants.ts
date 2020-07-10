import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

export const optionTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 25,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optionHeaderTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const applySettingsTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const settingsConstants = {
  optXSpace: screenSize.x * 0.4,
  optXPos: 140,
  volUnderlineYPos: screenSize.y * 0.25,
  volTextXpos: screenSize.x * 0.25,
  volTextYPos: screenSize.y * 0.23,
  volOptYPos: screenSize.y * 0.24,
  volOptTextAnchorX: 0.5,
  volOptTextAnchorY: 0.25,
  volContainerOpts: ['0', '0.5', '1.0', '1.5', '2.0'],
  applySettingsAnchorX: 0.33,
  applySettingsAnchorY: 0.85
};

export default settingsConstants;
