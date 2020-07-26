import FontAssets from '../assets/FontAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { HexColor } from '../utils/StyleUtils';

export const escapeOptButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const volumeRadioOptTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const escapeConstants = {
  buttonYPos: screenSize.y * 0.15,
  escapeOptTextConfig: { x: 0, y: 0, oriX: 0.37, oriY: 0.75 },

  settingsTextConfig: { x: screenSize.x * 0.38, y: -screenCenter.y * 0.1, oriX: 0.0, oriY: 0.5 },
  settingsYOffset: -screenCenter.y * 0.1,
  settingsYSpace: screenSize.y * 0.3,

  radioChoiceTextConfig: { x: 0, y: -45, oriX: 0.5, oriY: 0.25 },
  radioButtonsXSpace: screenSize.x * 0.2,

  volOptXPos: screenSize.x * 0.05,
  volOptYPos: -screenSize.y * 0.1
};

export default escapeConstants;
