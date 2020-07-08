import { screenSize } from 'src/features/game/commons/CommonConstants';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import { zektonFont } from 'src/features/game/commons/CommonFontAssets';

export const maxOptButtonsRow = 2;
export const optButtonsXSpace = screenSize.x * 0.9;
export const optButtonsYSpace = screenSize.y * 0.5;

export const mainMenuOptStyle: BitmapFontStyle = {
  key: zektonFont.key,
  size: 35,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const gameTxtStorageName = {
  defaultChapter: 'defaultChapter',
  checkpointTxt: 'checkpointTxt'
};
