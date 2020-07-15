import FontAssets from '../../assets/FontAssets';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const optionTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 25,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optionHeaderTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const applySettingsTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
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
  volOptYPos: -screenSize.y * 0.26,
  volContainerOpts: ['0', '0.5', '1.0', '1.5', '2.0']
};

export default settingsConstants;
