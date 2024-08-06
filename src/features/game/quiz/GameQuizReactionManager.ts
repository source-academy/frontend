import SoundAssets from '../assets/SoundAssets';
import DialogueGenerator from '../dialogue/GameDialogueGenerator';
import DialogueRenderer from '../dialogue/GameDialogueRenderer';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
import { promptWithChoices } from '../effects/Prompt';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { questionTextStyle } from './GameQuizConstants';
import { QuizSpeakerRenderer } from './GameQuizSpeakerRenderer';

/**
 * A class that manages the reaction after a option is selected or the quiz is complete
 *
 */
export default class GameQuizReactionManager {
  private dialogue: DialogueObject;
  private dialogueRenderer?: DialogueRenderer;
  private dialogueGenerator?: DialogueGenerator;
  private speakerRenderer?: QuizSpeakerRenderer;

  constructor(dialogue: DialogueObject) {
    this.dialogue = dialogue;
  }

  /**
   * It renders the reaction after the selection of an option or the quiz ends
   * @returns {Promise} the promise that resolves when the whole reaction is displayed
   */
  public async showReaction(): Promise<void> {
    this.dialogueRenderer = new DialogueRenderer(questionTextStyle);
    this.dialogueGenerator = new DialogueGenerator(this.dialogue);
    this.speakerRenderer = new QuizSpeakerRenderer();

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
      const response = await promptWithChoices(
        GameGlobalAPI.getInstance().getGameManager(),
        prompt.promptTitle,
        prompt.choices.map(choice => choice[0])
      );

      this.getDialogueGenerator().updateCurrPart(prompt.choices[response][1]);
    }
    await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
    GameGlobalAPI.getInstance().enableSprite(this.getDialogueRenderer().getDialogueBox(), true);

    if (!line) {
      resolve();
    }
  }

  private getDialogueGenerator = () => this.dialogueGenerator as DialogueGenerator;
  private getDialogueRenderer = () => this.dialogueRenderer as DialogueRenderer;
  private getSpeakerRenderer = () => this.speakerRenderer as QuizSpeakerRenderer;
  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
