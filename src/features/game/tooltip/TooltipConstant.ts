import FontAssets from '../assets/FontAssets';
import { screenCenter } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import dialogueConstants from '../dialogue/GameDialogueConstants';

export const notifStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 200,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const notifTextConfig = {
  x: screenCenter.x,
  y: dialogueConstants.rect.y + notifStyle.size * 2,
  oriX: 0.5,
  oriY: 0.9
};
