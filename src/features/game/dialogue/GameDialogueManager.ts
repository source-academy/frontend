import { ItemId } from '../commons/CommonsTypes';
import { Dialogue, DialogueLine } from './GameDialogueTypes';
import { Constants } from '../commons/CommonConstants';
import { fadeIn, fadeAndDestroy } from '../effects/FadeEffect';
import DialogueGenerator from './DialogueGenerator';
import GameActionManager from '../action/GameActionManager';
import { Layer } from '../layer/GameLayerTypes';
import { textTypeWriterStyle } from '../dialogue/DialogueConstants';
import DialogueRenderer from './GameDialogueRenderer';
import GameManager from '../scenes/gameManager/GameManager';
import { GamePhaseType } from '../phase/GamePhaseTypes';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public initialise(dialogueMap: Map<ItemId, Dialogue>) {
    this.dialogueMap = dialogueMap;
  }

  public playDialogue(dialogueId: ItemId): void {
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

    dialogueRenderer
      .getDialogueBox()
      .setInteractive({ useHandCursor: true, pixelPerfect: true })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () =>
        this.onClick(gameManager, generateDialogue, dialogueRenderer, dialogueContainer)
      );
  }

  public async onClick(
    gameManager: GameManager,
    generateDialogue: () => DialogueLine,
    dialogueRenderer: DialogueRenderer,
    dialogueContainer: Phaser.GameObjects.Container
  ) {
    const { line, speakerDetail, actionIds } = generateDialogue();
    dialogueRenderer.changeText(line);
    gameManager.characterManager.changeSpeakerTo(speakerDetail);
    GameActionManager.getInstance().getGameManager().phaseManager.pushPhase(GamePhaseType.Action, {
      actionIds: actionIds
    });
    if (!line) {
      dialogueRenderer.getDialogueBox().off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP);
      gameManager.characterManager.changeSpeakerTo(null);
      fadeAndDestroy(gameManager, dialogueContainer);
      gameManager.phaseManager.popPhase();
    }
  }
}
