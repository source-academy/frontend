import SoundAssets from '../assets/SoundAssets';
import { ItemId } from '../commons/CommonTypes';
import { promptWithChoices } from '../effects/Prompt';
import { keyboardShortcuts } from '../input/GameInputConstants';
import GameInputManager from '../input/GameInputManager';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import DialogueConstants, { textTypeWriterStyle } from './GameDialogueConstants';
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

  private skipButton?: Phaser.GameObjects.Image;
  private isSkipping: boolean = false;
  private nextLineResolve?: (value: void | PromiseLike<void>) => void;
  private isPrompting: boolean = false;
  private isDialoguePromptActive: boolean = false;

  /**
   * @param dialogueId the dialogue Id of the dialogue you want to play
   *
   * @returns {Promise} the promise that resolves when the entire dialogue has been played
   */
  public async showDialogue(dialogueId: ItemId): Promise<void> {
    GameGlobalAPI.getInstance().hideTooltip(); // make sure the tooltip is hidden before the dialogue
    const dialogue = GameGlobalAPI.getInstance().getDialogueById(dialogueId);

    this.dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    this.dialogueGenerator = new DialogueGenerator(dialogue.content);
    this.speakerRenderer = new DialogueSpeakerRenderer();

    const dialogueContainer = this.dialogueRenderer.getDialogueContainer();
    this.createSkipButton(dialogueContainer);

    GameGlobalAPI.getInstance().addToLayer(Layer.Dialogue, dialogueContainer);

    GameGlobalAPI.getInstance().fadeInLayer(Layer.Dialogue);
    await new Promise(resolve => this.playWholeDialogue(resolve as () => void));

    if (this.skipButton) {
      this.skipButton.destroy();
      this.skipButton = undefined;
    }

    this.getDialogueRenderer().destroy();
    this.getSpeakerRenderer().changeSpeakerTo(null);
  }

  private async playWholeDialogue(resolve: () => void) {
    await this.showNextLine(resolve);
    // add keyboard listener for dialogue box
    this.nextLineResolve = () => this.showNextLine(resolve);

    this.getInputManager().registerKeyboardListener(keyboardShortcuts.Next, 'up', async () => {
      // show the next line if dashboard or escape menu are not displayed
      if (
        !GameGlobalAPI.getInstance().getGameManager().getPhaseManager().isCurrentPhaseTerminal()
      ) {
        if (!this.isSkipping && !this.isPrompting) {
          await this.showNextLine(resolve);
        }
      }
    });

    this.getInputManager().registerKeyboardListener(
      keyboardShortcuts.SkipDialogue,
      'up',
      async () => {
        await this.triggerSkip();
      }
    );

    // Dialogue Box Mouse Click
    this.getDialogueRenderer()
      .getDialogueBox()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
        if (!this.isSkipping && !this.isPrompting) {
          await this.showNextLine(resolve);
        }
      });
  }

  private async triggerSkip() {
    if (this.isPrompting || this.isSkipping || this.isDialoguePromptActive) return;

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const phaseManager = gameManager.getPhaseManager();

    if (phaseManager.isCurrentPhaseTerminal()) return;

    const settings = SourceAcademyGame.getInstance().getSaveManager().getSettings();
    const requiresConfirm = settings.skipConfirm !== false;

    if (requiresConfirm) {
      this.isPrompting = true;

      if (this.skipButton) {
        this.skipButton.setVisible(false);
        this.skipButton.disableInteractive();
      }

      this.getInputManager().enableKeyboardInput(false);

      const dialogueBox = this.getDialogueRenderer().getDialogueBox();
      GameGlobalAPI.getInstance().enableSprite(dialogueBox, false);

      const response = await promptWithChoices(
        gameManager,
        'Skip remaining dialogue?',
        ['Yes', 'No'],
        Layer.Dialogue
      );

      this.getInputManager().enableKeyboardInput(true);
      GameGlobalAPI.getInstance().enableSprite(dialogueBox, true);

      if (this.skipButton) {
        this.skipButton.setVisible(true);
        this.skipButton.setInteractive({ useHandCursor: true });
      }

      this.isPrompting = false;

      if (response === 0) {
        await this.skipRemainingDialogue();
      }
    } else {
      await this.skipRemainingDialogue();
    }
  }

  private createSkipButton(dialogueContainer: Phaser.GameObjects.Container) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    this.skipButton = new Phaser.GameObjects.Image(
      gameManager,
      DialogueConstants.skipButton.x,
      DialogueConstants.skipButton.y,
      'skip-icon'
    ).setInteractive({ useHandCursor: true });

    this.skipButton.setDisplaySize(
      DialogueConstants.skipButton.size,
      DialogueConstants.skipButton.size
    );

    this.skipButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
      await this.triggerSkip();
    });

    dialogueContainer.add(this.skipButton);
  }

  /**
   * Skips all remaining dialogue until a prompt (choice) is encountered.
   * Does not skip prompts that require user input.
   */
  private async skipRemainingDialogue() {
    if (this.isSkipping) return;
    this.isSkipping = true;

    // Hide and disable the button while skipping
    if (this.skipButton && this.skipButton.active) {
      this.skipButton.setVisible(false);
      this.skipButton.disableInteractive();
    }

    GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);

    try {
      while (this.isSkipping) {
        if (!this.dialogueRenderer) break;
        this.dialogueRenderer.finishTypewriting();

        const nextLine = this.getDialogueGenerator().peekNextLine();
        const hasPrompt = nextLine && nextLine.prompt;
        const hasActions = nextLine && nextLine.actionIds && nextLine.actionIds.length > 0;

        if (this.nextLineResolve) {
          await this.nextLineResolve();
        }

        if (!this.skipButton || !this.skipButton.active) {
          this.isSkipping = false;
          break;
        }

        if (hasPrompt || hasActions) {
          this.isSkipping = false;
          break;
        }

        if (!nextLine || !nextLine.line) {
          this.isSkipping = false;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      this.isSkipping = false;

      if (
        this.skipButton &&
        this.skipButton.active &&
        !this.isDialoguePromptActive &&
        this.getDialogueGenerator().peekNextLine() !== null
      ) {
        this.skipButton.setVisible(true);
        this.skipButton.setInteractive({ useHandCursor: true });
      }
    }
  }

  public async showNextLine(resolve: () => void) {
    // Only play sound if we are not skipping, to avoid spamming sounds when skipping
    if (!this.isSkipping) {
      GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);
    }

    const { line, speakerDetail, actionIds, prompt } =
      await this.getDialogueGenerator().generateNextLine();

    const lineWithQuizScores = this.makeLineWithQuizScores(line);
    const lineWithName = lineWithQuizScores.replace('{name}', this.getUsername());
    this.getDialogueRenderer().changeText(lineWithName);
    this.getSpeakerRenderer().changeSpeakerTo(speakerDetail);

    // Store the current line into the storage
    GameGlobalAPI.getInstance().storeDialogueLine(lineWithName, speakerDetail);

    // Disable interactions while processing actions
    GameGlobalAPI.getInstance().enableSprite(this.getDialogueRenderer().getDialogueBox(), false);
    this.getInputManager().enableKeyboardInput(false);

    if (prompt) {
      // Prevent skipping, hide the skip button and prevent the usage of "s" keyboard shortcut
      this.isDialoguePromptActive = true;
      if (this.skipButton && this.skipButton.active) {
        this.skipButton.setVisible(false);
      }

      this.getInputManager().enableKeyboardInput(false);
      const response = await promptWithChoices(
        GameGlobalAPI.getInstance().getGameManager(),
        prompt.promptTitle,
        prompt.choices.map(choice => choice[0])
      );
      this.getInputManager().enableKeyboardInput(true);
      this.getDialogueGenerator().updateCurrPart(prompt.choices[response][1]);

      if (this.skipButton) this.skipButton.setVisible(true);
      this.isDialoguePromptActive = false;
    }

    await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
    GameGlobalAPI.getInstance().enableSprite(this.getDialogueRenderer().getDialogueBox(), true);
    this.getInputManager().enableKeyboardInput(true);

    if (!line) {
      //Permanently hide the skip button when there is no more dialogue
      if (this.skipButton && this.skipButton.active) {
        this.skipButton.setVisible(false);
      }

      // Prevents skipping by using the "s" keyboard shortcut
      this.getInputManager().clearKeyboardListeners([
        keyboardShortcuts.Next,
        keyboardShortcuts.SkipDialogue
      ]);
      resolve();
    } else if (!this.isSkipping && !this.isDialoguePromptActive) {
      if (this.skipButton && this.skipButton.active) {
        this.skipButton.setVisible(true);
        this.skipButton.setInteractive({ useHandCursor: true });
      }
    }
  }

  /**
   * Hide all dialogue boxes, speaker boxes and speaker sprites
   * */
  public async hideAll() {
    await this.getDialogueRenderer().hide();
    await this.getSpeakerRenderer().hide();
  }

  /**
   * Make all dialogue boxes, speaker boxes and speaker sprites visible
   * */
  public async showAll() {
    await this.getDialogueRenderer().show();
    await this.getSpeakerRenderer().show();
  }

  /**
   * Find patterns of quiz score interpolation in a dialogue line,
   * and replace them by actual scores.
   * The pattern: "{<quizId>.score}"
   *
   * @param line
   * @returns {string} the given line with all quiz score interpolation replaced by actual scores.
   */
  public makeLineWithQuizScores(line: string) {
    const quizScores = line.matchAll(/\{(.+?)\.score\}/g);
    for (const match of quizScores) {
      line = line.replace(match[0], GameGlobalAPI.getInstance().getQuizScore(match[1]).toString());
    }
    return line;
  }

  private getDialogueGenerator = () => this.dialogueGenerator as DialogueGenerator;
  private getDialogueRenderer = () => this.dialogueRenderer as DialogueRenderer;
  private getSpeakerRenderer = () => this.speakerRenderer as DialogueSpeakerRenderer;
  private getInputManager = () => this.gameInputManager as GameInputManager;

  public getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
