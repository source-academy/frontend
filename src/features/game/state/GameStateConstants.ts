import FontAssets from 'src/features/game/assets/FontAssets';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

export const emptyUserState = {
  collectibles: [],
  assessments: []
};

export const userStateStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};
