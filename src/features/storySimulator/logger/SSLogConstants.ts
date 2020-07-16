import FontAssets from 'src/features/game/assets/FontAssets';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { HexColor } from 'src/features/game/utils/StyleUtils';

export const loggableStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 27,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
