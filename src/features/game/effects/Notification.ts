import { Layer } from 'src/features/game/layer/GameLayerTypes';

import FontAssets from '../assets/FontAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenCenter } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import dialogueConstants from '../dialogue/GameDialogueConstants';
import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
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

const notifTextConfig = {
  x: screenCenter.x,
  y: dialogueConstants.rect.y + notifStyle.size * 2,
  oriX: 0.5,
  oriY: 0.9
};

/**
 * A function to display a notifications such as location-change notification
 *
 * @param message - the string you want to display
 * @returns {Promise} - a promise that resolves when notification is clicked
 */
export async function displayNotification(message: string): Promise<void> {
  const gameManager = GameGlobalAPI.getInstance().getGameManager();
  const dialogueRenderer = new DialogueRenderer({});
  const container = dialogueRenderer.getDialogueContainer();

  GameGlobalAPI.getInstance().addContainerToLayer(Layer.Effects, container);
  GameGlobalAPI.getInstance().fadeInLayer(Layer.Effects);

  const notifText = createBitmapText(gameManager, message, notifTextConfig, notifStyle).setAlpha(0);
  container.add(notifText);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
  gameManager.add.tween(fadeIn([notifText], Constants.fadeDuration * 2));

  // Wait for fade in to finish
  await sleep(Constants.fadeDuration * 2);

  const showNotification = new Promise(resolve => {
    dialogueRenderer.getDialogueBox().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
      fadeAndDestroy(gameManager, notifText, { fadeDuration: Constants.fadeDuration / 4 });
      dialogueRenderer.destroy();
      resolve();
    });
  });

  await showNotification;
}
