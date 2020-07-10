import { HexColor } from 'src/features/game/utils/StyleUtils';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { zektonFont } from 'src/features/game/commons/CommonFontAssets';

export const altTextStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};

const iconBgSize = 55;

const SSCursorModeConstants = {
  iconBgSize: iconBgSize,
  iconSize: 40,
  iconSpacing: 15,
  inactiveAlpha: 0.7,
  onHoverAlpha: 1.0,
  activeAlpha: 0.9,
  altTextXPos: iconBgSize * 0.8,
  altTextYPos: -iconBgSize * 0.4,
  altTextMargin: 10
};

export default SSCursorModeConstants;
