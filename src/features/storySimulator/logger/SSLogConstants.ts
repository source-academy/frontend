import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import FontAssets from 'src/features/game/assets/FontAssets';

export const loggableStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 27,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
