import { HexColor } from 'src/features/game/utils/StyleUtils';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { zektonFont } from 'src/features/game/commons/CommonFontAssets';

export const iconBgSize = 55;
export const iconSize = 40;
export const iconSpacing = 15;

export const inactiveAlpha = 0.7;
export const onHoverAlpha = 1.0;
export const activeAlpha = 0.9;

export const altTextXPos = iconBgSize * 0.8;
export const altTextYPos = -iconBgSize * 0.4;
export const altTextMargin = 10;

export const altTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
