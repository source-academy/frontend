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

  public async destroyDialogue() {}

  public async playDialogue(dialogueId: ItemId) {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return undefined;
    }

    const gameManager = GameActionManager.getInstance().getGameManager();
    const generateDialogue = DialogueGenerator(dialogue);

    const dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    const container = dialogueRenderer.getDialogueContainer();

    gameManager.layerManager.addToLayer(Layer.Dialogue, container);
    gameManager.add.tween(fadeIn([container], Constants.fadeDuration * 2));
    dialogueRenderer
      .getDialogueBox()
      .setInteractive({ useHandCursor: true, pixelPerfect: true })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
        const { line, speakerDetail, actionIds } = generateDialogue();
        dialogueRenderer.changeText(line);
        GameActionManager.getInstance().changeSpeaker(speakerDetail);
        await GameActionManager.getInstance().executeStoryAction(actionIds);
        if (!line) {
          GameActionManager.getInstance().changeSpeaker(null);
          fadeAndDestroy(gameManager, container);
          gameManager.phaseManager.popPhase();
        }
      });

    return true;
  }
}
