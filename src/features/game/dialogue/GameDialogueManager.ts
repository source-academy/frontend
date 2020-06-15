import { ItemId } from '../commons/CommonsTypes';
import { Dialogue } from './GameDialogueTypes';
import { Constants } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import DialogueGenerator from './DialogueGenerator';
import Typewriter from '../effects/Typewriter';
import { speechBox } from '../commons/CommonAssets';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { textPadding, dialogueRect, typeWriterTextStyle } from '../dialogue/DialogueConstants';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public initialise(dialogueMap: Map<ItemId, Dialogue>) {
    this.dialogueMap = dialogueMap;
  }

  public async playDialogue(dialogueId: ItemId) {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return undefined;
    }

    const gameManager = GameActionManager.getInstance().getGameManager();

    const dialogueBox = this.createDialogueBox(gameManager);
    const typewriter = Typewriter(gameManager, {
      x: dialogueRect.x + textPadding.x,
      y: dialogueRect.y + textPadding.y,
      textStyle: typeWriterTextStyle
    });

    const generateDialogue = DialogueGenerator(dialogue);

    const container = new Phaser.GameObjects.Container(gameManager, 0, 0).setAlpha(0);
    container.add([dialogueBox, typewriter.container]);

    const activateContainer = new Promise(res => {
      gameManager.layerManager.addToLayer(Layer.Dialogue, container);
      gameManager.add.tween(fadeIn([container], Constants.fadeDuration * 2));
      dialogueBox
        .setInteractive({ useHandCursor: true, pixelPerfect: true })
        .on('pointerdown', async () => {
          const { line, speakerDetail, actions } = generateDialogue();
          typewriter.changeLine(line);
          GameActionManager.getInstance().changeSpeaker(speakerDetail);
          if (actions) {
            await GameActionManager.getInstance().executeSafeAction(actions);
          }
          if (!line) {
            res('done');
            GameActionManager.getInstance().changeSpeaker(null);
            fadeAndDestroy(gameManager, container);
          }
        });
    });

    await activateContainer;
    return true;
  }

  /* Speech Box */
  private createDialogueBox(scene: Phaser.Scene) {
    const dialogueBox = new Phaser.GameObjects.Image(
      scene,
      dialogueRect.x,
      dialogueRect.y,
      speechBox.key
    )
      .setOrigin(0)
      .setDisplaySize(dialogueRect.width, dialogueRect.height)
      .setAlpha(0.8);

    return dialogueBox;
  }
}
