import { ItemId } from '../commons/CommonsTypes';
import { Dialogue } from './GameDialogueTypes';
import { Constants } from '../commons/CommonConstants';
import { fadeIn } from '../effects/FadeEffect';
import DialogueGenerator from './DialogueGenerator';
import { Layer } from '../layer/GameLayerTypes';
import { textTypeWriterStyle } from '../dialogue/DialogueConstants';
import DialogueRenderer from './GameDialogueRenderer';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import GameManager from '../scenes/gameManager/GameManager';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;
  private gameManager: GameManager;

  constructor(scene: GameManager) {
    this.gameManager = scene;
    this.dialogueMap = scene.currentCheckpoint.map.getDialogues();
  }

  public async bringUpDialogue(dialogueId: ItemId) {
    await this.gameManager.getPhaseManager().pushPhase(GamePhaseType.Sequence);
    await this.playDialogue(dialogueId);
    await this.gameManager.getPhaseManager().popPhase();
  }

  public async playDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return;
    }

    const generateDialogue = DialogueGenerator(dialogue);

    const dialogueRenderer = new DialogueRenderer(this.gameManager, textTypeWriterStyle);
    const dialogueContainer = dialogueRenderer.getDialogueContainer();

    this.gameManager.getLayerManager().addToLayer(Layer.Dialogue, dialogueContainer);
    this.gameManager.add.tween(fadeIn([dialogueContainer], Constants.fadeDuration * 2));

    async function nextLine(thisClass: DialogueManager, resolve: () => void) {
      const { line, speakerDetail, actionIds } = generateDialogue();
      const lineWithName = line.replace('{name}', thisClass.gameManager.getAccountInfo().name);
      dialogueRenderer.changeText(lineWithName);
      thisClass.gameManager.getCharacterManager().changeSpeakerTo(speakerDetail);
      thisClass.gameManager.getActionExecuter().executeStoryActions(actionIds);
      if (!lineWithName) {
        resolve();
        dialogueRenderer.destroy();
        thisClass.gameManager.getCharacterManager().changeSpeakerTo(null);
      }
    }

    const activateContainer = new Promise(resolve => {
      nextLine(this, resolve);
      dialogueRenderer
        .getDialogueBox()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => await nextLine(this, resolve));
    });

    await activateContainer;
  }
}
