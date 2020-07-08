import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { zektonFont } from 'src/features/game/commons/CommonFontAssets';
import { HexColor } from 'src/features/game/utils/StyleUtils';

export const loggableStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
