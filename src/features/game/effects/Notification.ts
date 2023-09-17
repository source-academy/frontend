import FontAssets from 'src/features/game/assets/FontAssets';
import SoundAssets from 'src/features/game/assets/SoundAssets';
import { Constants, screenCenter } from 'src/features/game/commons/CommonConstants';
import { BitmapFontStyle, IBaseScene } from 'src/features/game/commons/CommonTypes';
import dialogueConstants from 'src/features/game/dialogue/GameDialogueConstants';
import DialogueRenderer from 'src/features/game/dialogue/GameDialogueRenderer';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import SourceAcademyGame from 'src/features/game/SourceAcademyGame';
import { sleep } from 'src/features/game/utils/GameUtils';
import { createBitmapText } from 'src/features/game/utils/TextUtils';

import { fadeAndDestroy, fadeIn } from './FadeEffect';

const notifStyle: BitmapFontStyle = {
  key: FontAssets.alienLeagueFont.key,
  size: 100,
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
 * @param scene scene to attach this message to
 * @param message - the string you want to display
 * @returns {Promise} - a promise that resolves when notification is clicked
 */
export async function displayNotification(scene: IBaseScene, message: string): Promise<void> {
  const dialogueRenderer = new DialogueRenderer({});
  const container = dialogueRenderer.getDialogueContainer();

  scene.getLayerManager().addToLayer(Layer.Effects, container);
  scene.getLayerManager().fadeInLayer(Layer.Effects);

  const notifText = createBitmapText(scene, message, notifTextConfig, notifStyle).setAlpha(0);
  container.add(notifText);

  SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
  scene.add.tween(fadeIn([notifText], Constants.fadeDuration * 2));

  // Wait for fade in to finish
  await sleep(Constants.fadeDuration * 2);

  const showNotification = new Promise<void>(resolve => {
    dialogueRenderer.getDialogueBox().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
      fadeAndDestroy(scene, notifText, { fadeDuration: Constants.fadeDuration / 4 });
      dialogueRenderer.destroy();
      resolve();
    });
  });

  await showNotification;
}
