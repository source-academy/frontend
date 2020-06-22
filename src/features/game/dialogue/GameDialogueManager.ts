import { ItemId } from '../commons/CommonsTypes';
import { Dialogue } from './GameDialogueTypes';
import { Constants } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import DialogueGenerator from './DialogueGenerator';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { textTypeWriterStyle } from '../dialogue/DialogueConstants';
import DialogueRenderer from './GameDialogueRenderer';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public initialise(dialogueMap: Map<ItemId, Dialogue>) {
    this.dialogueMap = dialogueMap;
  }

  public async playDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return;
    }

    const gameManager = GameActionManager.getInstance().getGameManager();
    const generateDialogue = DialogueGenerator(dialogue);

    const dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    const dialogueContainer = dialogueRenderer.getDialogueContainer();

    gameManager.layerManager.addToLayer(Layer.Dialogue, dialogueContainer);
    gameManager.add.tween(fadeIn([dialogueContainer], Constants.fadeDuration * 2));

    const activateDialogue = new Promise(resolve => {
      dialogueRenderer
        .getDialogueBox()
        .setInteractive({ useHandCursor: true, pixelPerfect: true })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
          const { line, speakerDetail, actionIds } = generateDialogue();
          dialogueRenderer.changeText(line);
          gameManager.characterManager.changeSpeakerTo(speakerDetail);
          await GameActionManager.getInstance()
            .getGameManager()
            .actionExecuter.executeStoryActions(actionIds);
          if (!line) {
            dialogueRenderer.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
            resolve();
            gameManager.characterManager.changeSpeakerTo(null);
            fadeAndDestroy(gameManager, dialogueContainer);
          }
        });
    });

    await activateDialogue;
  }
}
