import FontAssets from '../assets/FontAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenCenter } from '../commons/CommonConstants';
import { BitmapFontStyle, IBaseScene } from '../commons/CommonTypes';
import dialogueConstants from '../dialogue/GameDialogueConstants';
import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import { keyboardShortcuts } from '../input/GameInputConstants';
import GameInputManager from '../input/GameInputManager';
import { Layer } from '../layer/GameLayerTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { sleep } from '../utils/GameUtils';
import { createBitmapText } from '../utils/TextUtils';
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

  const gameInputManager = new GameInputManager(scene);

  const dissolveNotification = () => {
    SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
    fadeAndDestroy(scene, notifText, { fadeDuration: Constants.fadeDuration / 4 });
    dialogueRenderer.destroy();
  };

  const showNotification = new Promise<void>(resolve => {
    // using the same binding as dialogue shortcut
    gameInputManager.registerKeyboardListener(keyboardShortcuts.Notif, 'up', async () => {
      gameInputManager.clearKeyboardListeners([keyboardShortcuts.Notif]);
      dissolveNotification();
      resolve();
    });

    dialogueRenderer.getDialogueBox().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      dissolveNotification();
      resolve();
    });
  });

  await showNotification;
}
