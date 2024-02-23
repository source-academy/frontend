import FontAssets from 'src/features/game/assets/FontAssets';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

export const loggableStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 27,
  align: Phaser.GameObjects.BitmapText.ALIGN_LEFT
};
