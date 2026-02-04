import FontAssets from '../assets/FontAssets';
import { screenCenter, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';

export const escapeOptButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const volumeRadioOptTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const EscapeConstants = {
  button: { y: screenSize.y * 0.15 },
  escapeOptTextConfig: { x: 0, y: 0, oriX: 0.37, oriY: 0.75 },
  settings: { yOffset: -screenCenter.y * 0.1, ySpace: screenSize.y * 0.3 },
  settingsTextConfig: { x: screenSize.x * 0.38, y: -screenCenter.y * 0.1, oriX: 0.0, oriY: 0.5 },
  radioButtons: { xSpace: screenSize.x * 0.2 },
  radioChoiceTextConfig: { x: 0, y: -45, oriX: 0.5, oriY: 0.25 },
  volOpt: { x: screenSize.x * 0.05 }
};

export default EscapeConstants;
