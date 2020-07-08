import { Color } from '../../utils/StyleUtils';
import { screenSize } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { zektonFont } from '../../commons/CommonFontAssets';
import { HexColor } from '../../utils/StyleUtils';

export const optionsXSpace = screenSize.x * 0.4;
export const optionsXPos = 140;

export const volumeUnderlineYPos = screenSize.y * 0.25;
export const volumeTextXpos = screenSize.x * 0.25;
export const volumeTextYPos = screenSize.y * 0.23;
export const volumeOptionYPos = screenSize.y * 0.24;
export const volumeOptionTextAnchorX = 0.5;
export const volumeOptionTextAnchorY = 0.25;
export const volumeContainerOptions = ['0', '0.5', '1.0', '1.5', '2.0'];

export const applySettingsAnchorX = 0.33;
export const applySettingsAnchorY = 0.85;

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

export const applySettingsTextStyle = {
  fontFamily: 'Helvetica',
  fontSize: '30px',
  fill: Color.lightBlue,
  align: 'center'
};
