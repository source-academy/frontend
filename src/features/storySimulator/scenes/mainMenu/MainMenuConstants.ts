import FontAssets from 'src/features/game/assets/FontAssets';
import { screenSize } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle } from 'src/features/game/commons/CommonTypes';

export const mainMenuOptStyle: BitmapFontStyle = {
  key: FontAssets.zektonDarkFont.key,
  size: 35,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const SSMainMenuConstants = {
  maxOptButtonsRow: 2,
  optButton: { xSpace: screenSize.x * 0.9, ySpace: screenSize.y * 0.5 },
  gameTxtStorageName: {
    defaultChapter: 'defaultChapter',
    checkpointTxt: 'checkpointTxt'
  }
};

export default SSMainMenuConstants;
