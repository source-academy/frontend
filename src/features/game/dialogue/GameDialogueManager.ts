import { ItemId } from '../commons/CommonTypes';
import { Dialogue } from './GameDialogueTypes';
import DialogueGenerator from './GameDialogueGenerator';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Layer } from '../layer/GameLayerTypes';
import { textTypeWriterStyle } from './GameDialogueConstants';
import DialogueRenderer from './GameDialogueRenderer';
import GameManager from '../scenes/gameManager/GameManager';
import { mandatory } from '../utils/GameUtils';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;
  private dialogueRenderer?: DialogueRenderer;
  private dialogueGenerator?: DialogueGenerator;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public initialise(gameManager: GameManager) {
    this.dialogueMap = gameManager.getCurrentCheckpoint().map.getDialogues();
  }

  public async showDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = this.dialogueMap.get(dialogueId);
    if (!dialogue) return;
    this.dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    this.dialogueGenerator = new DialogueGenerator(dialogue.content);

    GameGlobalAPI.getInstance().addContainerToLayer(
      Layer.Dialogue,
      this.dialogueRenderer.getDialogueContainer()
    );
    GameGlobalAPI.getInstance().fadeInLayer(Layer.Dialogue);

    await new Promise(async resolve => {
      await this.showNextLine(resolve);
      this.getDialogueRenderer()
        .getDialogueBox()
        .on(
          Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
          async () => await this.showNextLine(resolve)
        );
    });
  }

  private async showNextLine(resolve: () => void) {
    const { line, speakerDetail, actionIds } = this.getDialogueGenerator().generateNextLine();
    const lineWithName = line.replace('{name}', GameGlobalAPI.getInstance().getAccountInfo().name);
    this.getDialogueRenderer().changeText(lineWithName);
    GameGlobalAPI.getInstance().changeSpeakerTo(speakerDetail);
    await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
    if (!line) {
      resolve();
      this.getDialogueRenderer().destroy();
      GameGlobalAPI.getInstance().changeSpeakerTo(null);
    }
  }

  private getDialogueGenerator = () => mandatory(this.dialogueGenerator) as DialogueGenerator;
  private getDialogueRenderer = () => mandatory(this.dialogueRenderer) as DialogueRenderer;
}
