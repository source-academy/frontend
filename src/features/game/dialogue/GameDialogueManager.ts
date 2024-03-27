import SoundAssets from '../assets/SoundAssets';
import { ItemId } from '../commons/CommonTypes';
import { promptWithChoices } from '../effects/Prompt';
import { keyboardShortcuts } from '../input/GameInputConstants';
import GameInputManager from '../input/GameInputManager';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { textTypeWriterStyle } from './GameDialogueConstants';
import DialogueGenerator from './GameDialogueGenerator';
import DialogueRenderer from './GameDialogueRenderer';
import DialogueSpeakerRenderer from './GameDialogueSpeakerRenderer';

/**
 * Given a dialogue Id, this manager renders the correct dialogue.
 * It displays the lines, speakers, and performs actions
 * whenever players click on the dialogue box
 */

export default class DialogueManager {
  private speakerRenderer?: DialogueSpeakerRenderer;
  private dialogueRenderer?: DialogueRenderer;
  private dialogueGenerator?: DialogueGenerator;
  private gameInputManager?: GameInputManager = new GameInputManager(
    GameGlobalAPI.getInstance().getGameManager()
  );

  /**
   * @param dialogueId the dialogue Id of the dialogue you want to play
   *
   * @returns {Promise} the promise that resolves when the entire dialogue has been played
   */
  public async showDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = GameGlobalAPI.getInstance().getDialogueById(dialogueId);

    this.dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    this.dialogueGenerator = new DialogueGenerator(dialogue.content);
    this.speakerRenderer = new DialogueSpeakerRenderer();

    GameGlobalAPI.getInstance().addToLayer(
      Layer.Dialogue,
      this.dialogueRenderer.getDialogueContainer()
    );

    GameGlobalAPI.getInstance().fadeInLayer(Layer.Dialogue);
    await new Promise(resolve => this.playWholeDialogue(resolve as () => void));
    this.getDialogueRenderer().destroy();
    this.getSpeakerRenderer().changeSpeakerTo(null);
  }

  private async playWholeDialogue(resolve: () => void) {
    await this.showNextLine(resolve);
    // add keyboard listener for dialogue box
    this.getInputManager().registerKeyboardListener(keyboardShortcuts.Next, 'up', async () => {
      // show the next line if dashboard or escape menu are not displayed
      if (
        !GameGlobalAPI.getInstance().getGameManager().getPhaseManager().isCurrentPhaseTerminal()
      ) {
        await this.showNextLine(resolve);
      }
    });
    this.getDialogueRenderer()
      .getDialogueBox()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
        await this.showNextLine(resolve);
      });
  }

  private async showNextLine(resolve: () => void) {
    GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);
    const { line, speakerDetail, actionIds, prompt } =
      await this.getDialogueGenerator().generateNextLine();
    const lineWithName = line.replace('{name}', this.getUsername());
    this.getDialogueRenderer().changeText(lineWithName);
    this.getSpeakerRenderer().changeSpeakerTo(speakerDetail);

    // Store the current line into the storage
    GameGlobalAPI.getInstance().storeDialogueLine(lineWithName, speakerDetail);

    // Disable interactions while processing actions
    GameGlobalAPI.getInstance().enableSprite(this.getDialogueRenderer().getDialogueBox(), false);

    if (prompt) {
      // disable keyboard input to prevent continue dialogue
      this.getInputManager().enableKeyboardInput(false);
      const response = await promptWithChoices(
        GameGlobalAPI.getInstance().getGameManager(),
        prompt.promptTitle,
        prompt.choices.map(choice => choice[0])
      );

      this.getInputManager().enableKeyboardInput(true);
      this.getDialogueGenerator().updateCurrPart(prompt.choices[response][1]);
    }
    await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
    GameGlobalAPI.getInstance().enableSprite(this.getDialogueRenderer().getDialogueBox(), true);

    if (!line) {
      // clear keyboard listeners when dialogue ends
      this.getInputManager().clearKeyboardListeners([keyboardShortcuts.Next]);
      resolve();
    }
  }

  private getDialogueGenerator = () => this.dialogueGenerator as DialogueGenerator;
  private getDialogueRenderer = () => this.dialogueRenderer as DialogueRenderer;
  private getSpeakerRenderer = () => this.speakerRenderer as DialogueSpeakerRenderer;
  private getInputManager = () => this.gameInputManager as GameInputManager;

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
