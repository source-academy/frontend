import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import { titleTypeWriterStyle } from '../dialogue/DialogueConstants';
import { fadeIn } from './FadeEffect';
import { Constants } from '../commons/CommonConstants';
import { sleep } from '../utils/GameUtils';
import { ILayeredScene, Layer } from '../layer/GameLayerTypes';

export async function displayNotification(scene: ILayeredScene, message: string): Promise<void> {
  const dialogueRenderer = new DialogueRenderer(scene, titleTypeWriterStyle);
  const container = dialogueRenderer.getDialogueContainer();

  scene.getLayerManager().addToLayer(Layer.Dialogue, container);
  scene.add.tween(fadeIn([container], Constants.fadeDuration * 2));

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
