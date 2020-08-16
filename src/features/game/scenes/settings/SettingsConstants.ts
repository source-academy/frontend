import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';

export const optionTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optionHeaderTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const applySettingsTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const SettingsConstants = {
  optHeaderTextConfig: { x: screenSize.x * 0.25, y: 0, oriX: 0.5, oriY: 0.75 },
  opt: { x: 140, xSpace: screenSize.x * 0.4, ySpace: screenSize.y * 0.7 },
  radioButtonsTextConfig: { x: 0, y: -50, oriX: 0.5, oriY: 0.25 },
  volContainerOpts: ['0', '0.25', '0.5', '1.0', '1.5', '2.0']
};

export default SettingsConstants;
