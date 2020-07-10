import { screenSize } from 'src/features/game/commons/CommonConstants';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';
import FontAssets from 'src/features/game/assets/FontAssets';

export const mainMenuOptStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 35,
  fill: HexColor.darkBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const SSMainMenuConstants = {
  maxOptButtonsRow: 2,
  optButtonsXSpace: screenSize.x * 0.9,
  optButtonsYSpace: screenSize.y * 0.5,
  gameTxtStorageName: {
    defaultChapter: 'defaultChapter',
    checkpointTxt: 'checkpointTxt'
  }
};

export default SSMainMenuConstants;
