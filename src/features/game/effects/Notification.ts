import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import { titleTypeWriterStyle } from '../dialogue/DialogueConstants';
import { fadeIn } from './FadeEffect';
import { Constants } from '../commons/CommonConstants';
import GameActionManager from '../action/GameActionManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { sleep } from '../utils/GameUtils';

export async function displayNotification(message: string): Promise<void> {
  const gameManager = GameActionManager.getInstance().getGameManager();
  const dialogueRenderer = new DialogueRenderer(titleTypeWriterStyle);
  const container = dialogueRenderer.getDialogueContainer();

  GameActionManager.getInstance().addContainerToLayer(Layer.Effects, container);
  gameManager.add.tween(fadeIn([container], Constants.fadeDuration * 2));

  // Wait for fade in to finish
  await sleep(Constants.fadeDuration * 2);
  dialogueRenderer.changeText(message);

  const showNotification = new Promise(resolve => {
    dialogueRenderer.getDialogueBox().on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      dialogueRenderer.destroy();
      resolve();
    });
  });
  await showNotification;
}
