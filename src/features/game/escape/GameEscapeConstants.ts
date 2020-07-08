import { screenSize } from '../commons/CommonConstants';
import { HexColor } from '../utils/StyleUtils';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { zektonFont } from '../commons/CommonFontAssets';

export const escapeOptButtonStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const volumeRadioOptTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const escapeTextOriX = 0.33;
export const escapeTextOriY = 0.85;
export const escapeButtonYPos = screenSize.y * 0.65;

export const optHeaderTextXPos = screenSize.x * 0.38;
export const optHeaderTextYPos = screenSize.y * 0.38;
export const radioButtonsXSpace = screenSize.x * 0.2;

export const volumeOptXPos = screenSize.x * 0.05;
export const volumeOptYPos = screenSize.y * 0.4;
export const volumeOptTextAnchorX = 0.5;
export const volumeOptTextAnchorY = 0.25;
export const volumeOptTextXOffset = 0;
export const volumeOptTextYOffset = -65;
