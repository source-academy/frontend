import { Layer } from 'src/features/game/layer/GameLayerTypes';

import FontAssets from '../assets/FontAssets';
import { Constants, screenCenter } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import dialogueConstants from '../dialogue/GameDialogueConstants';
import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { sleep } from '../utils/GameUtils';
import { HexColor } from '../utils/StyleUtils';
import { createBitmapText } from '../utils/TextUtils';
import { fadeAndDestroy, fadeIn } from './FadeEffect';

const notifStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 100,
  fill: HexColor.paleYellow,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const notifYPos = dialogueConstants.rect.y + notifStyle.size * 2;

export async function displayNotification(message: string): Promise<void> {
  const gameManager = GameGlobalAPI.getInstance().getGameManager();
  const dialogueRenderer = new DialogueRenderer({});
  const container = dialogueRenderer.getDialogueContainer();

  GameGlobalAPI.getInstance().addContainerToLayer(Layer.Effects, container);
  GameGlobalAPI.getInstance().fadeInLayer(Layer.Effects);

  const notifText = createBitmapText(gameManager, message, screenCenter.x, notifYPos, notifStyle)
    .setOrigin(0.5, 0.9)
    .setAlpha(0);
  container.add(notifText);

  gameManager.add.tween(fadeIn([notifText], Constants.fadeDuration * 2));

  // Wait for fade in to finish
  await sleep(Constants.fadeDuration * 2);

  const showNotification = new Promise(resolve => {
    dialogueRenderer.getDialogueBox().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      fadeAndDestroy(gameManager, notifText, { fadeDuration: Constants.fadeDuration / 4 });
      dialogueRenderer.destroy();
      resolve();
    });
  });

  await showNotification;
}
