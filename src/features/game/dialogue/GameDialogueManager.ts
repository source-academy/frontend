import SoundAssets from '../assets/SoundAssets';
import { screenSize } from '../commons/CommonConstants';
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

  //Proposal: Add the following 3 lines
  private skipButton?: Phaser.GameObjects.Container;
  private isSkipping: boolean = false;
  private nextLineResolve?: (value: void | PromiseLike<void>) => void;

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

    //Proposal: Add the skip button and dialogue container (next 2 lines)
    const dialogueContainer = this.dialogueRenderer.getDialogueContainer();
    this.createSkipButton(dialogueContainer);

    GameGlobalAPI.getInstance().addToLayer(
      Layer.Dialogue,
      dialogueContainer
    );

    GameGlobalAPI.getInstance().fadeInLayer(Layer.Dialogue);
    await new Promise(resolve => this.playWholeDialogue(resolve as () => void));

    //Proposal: If skip button still exists, destroy it (next 3 lines)
    //Clean up the skip button before destroying renderer
    if (this.skipButton) {
      this.skipButton.destroy();
      this.skipButton = undefined;
    }

    this.getDialogueRenderer().destroy();
    this.getSpeakerRenderer().changeSpeakerTo(null);
  }

  private async playWholeDialogue(resolve: () => void) {
    await this.showNextLine(resolve);

    //Proposal: Store the resolve function so skip can use it (next 1 line)
    this.nextLineResolve = () => this.showNextLine(resolve);

    //Proposal: Add keyboard listener for skipping dialogue (next block)
    this.getInputManager().registerKeyboardListener(
      keyboardShortcuts.SkipDialogue, // Or Phaser.Input.Keyboard.KeyCodes.S
      'up',
      async () => {
        // 1. Check if we are allowed to skip right now (not in menu)
        const phaseManager = GameGlobalAPI.getInstance().getGameManager().getPhaseManager();
        if (phaseManager.isCurrentPhaseTerminal()) {
          return;
        }

        // 2. Trigger the exact same logic the on-screen button uses
        await this.triggerSkipLogic();
      }
    );

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
        //Proposal: If we are already skipping, they do not need to click, 
        //so to avoid unintended double skipping past prompts, we set clicking to not do anything 
        //(added the if condition)
        if (!this.isSkipping) {
          await this.showNextLine(resolve);
        }
      });
  }

  //Proposal: createSkipButton method
  // private createSkipButton(dialogueContainer: Phaser.GameObjects.Container) {
  //   const gameManager = GameGlobalAPI.getInstance().getGameManager();
    
  //   // Replace 'someExistingAsset' with an actual asset from ImageAssets
  //   this.skipButton = new Phaser.GameObjects.Image(
  //     gameManager,
  //     50, //Position from left (CUrrently top left)
  //     20, //Height from top
  //     ImageAssets.shortButton.key  // Use an asset that exists - Works now, but cannot see the button
  //   ).setDisplaySize(40, 40)
  //     .setInteractive({ useHandCursor: true })
  //     .setDepth(1000);

  //   this.skipButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
  //     await this.skipRemainingDialogue();
  //   });

  //   // Add directly to the game scene, NOT to dialogueContainer
  //   gameManager.add.existing(this.skipButton);
    
  //   // So it can be properly cleaned up
  //   dialogueContainer.add(this.skipButton);
  // }

  //Proposal: createSkipButton method ver2
  private createSkipButton(dialogueContainer: Phaser.GameObjects.Container) {
    const gameManager = GameGlobalAPI.getInstance().getGameManager();

    // 1. Create the Button Background (Green Rectangle)
    const buttonBg = new Phaser.GameObjects.Rectangle(
      gameManager,
      0, 0,    // Relative position inside container (center)
      60, 30,  // Width, Height
      0x4CAF50 // Color (Green)
    ).setInteractive({ useHandCursor: true });

    // 2. Create the Button Text
    const buttonText = new Phaser.GameObjects.Text(
      gameManager,
      0, 0,    // Relative position inside container (center)
      'SKIP',
      { fontSize: '14px', color: '#FFFFFF', fontStyle: 'bold' }
    ).setOrigin(0.5);

    // 3. Create a Container to hold them together
    this.skipButton = new Phaser.GameObjects.Container(
      gameManager,
      screenSize.x - 80,                // X: width position 
      screenSize.y * 0.65                 // Y: height position 
    );

    this.skipButton.add([buttonBg, buttonText]);

    //4. Add Click Listener
    buttonBg.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => {
      const phaseManager = gameManager.getPhaseManager();
      if (phaseManager.isCurrentPhaseTerminal()) {
        return;
      }

      //Use the shared logic
      await this.triggerSkipLogic();
    });

    //Add it to the dialogue container 
    dialogueContainer.add(this.skipButton);
  }


  //Proposal: triggerSkipLogic method
  private async triggerSkipLogic() {
    if (this.isSkipping) return;

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const settings = SourceAcademyGame.getInstance().getSaveManager().getSettings();
    const requiresConfirm = settings.skipConfirm !== false;

    if (requiresConfirm) {
      this.getInputManager().enableKeyboardInput(false);

      const response = await promptWithChoices(
        gameManager,
        'Skip remaining dialogue?',
        ['Yes', 'No']
      );

      this.getInputManager().enableKeyboardInput(true);

      if (response === 0) { // Yes clicked
        await this.skipRemainingDialogue();
      }
    } else {
      await this.skipRemainingDialogue();
    }
  }


  //Proposal: skipRemainingDialogue method
  /**
   * Skips all remaining dialogue until a prompt (choice) is encountered.
   * Does NOT skip prompts that require user input.
   */
  private async skipRemainingDialogue() {
    if (this.isSkipping) return; // Prevent multiple skip calls
    this.isSkipping = true;

    //Plays the sound effect exactly once when skip starts
    GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);

    try {
      // Keep advancing the dialogue until we hit a stopping point
      while (this.isSkipping) {
        // 1. Finish any typewriter animation instantly
        if (this.dialogueRenderer) {
          this.dialogueRenderer.finishTypewriting();
        }

        // 2. Peek at the next line WITHOUT advancing yet
        const nextLine = await this.peekNextLine();

        // STOP CONDITION 1: No more dialogue
        if (!nextLine || !nextLine.line) {
          this.isSkipping = false;
          break;
        }

        // STOP CONDITION 2: Next line has a prompt (user choice)
        if (nextLine.prompt) {
          this.isSkipping = false;
          break;
        }

        // 3. Safe to skip: advance to the next line
        // We use nextLineResolve to trigger showNextLine without user click
        if (this.nextLineResolve) {
          await this.showNextLine(() => {});  
        }

        // Small delay to prevent freezing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      this.isSkipping = false;
    }
  }

  //Proposal: peekNextLine method
  // Peek at the next line without advancing the dialogue generator.
  // This allows us to check for prompts without committing to advancing.
  private async peekNextLine() {
    // We need to look ahead in the dialogue generator
    // Unfortunately, DialogueGenerator doesn't have a peek method,
    // so we'll store the current state, peek, then restore

    const currentPart = (this.getDialogueGenerator() as any).currPart;
    const currentLineNum = (this.getDialogueGenerator() as any).currLineNum;

    // Generate the next line (this advances internal state)
    const nextLine = await this.getDialogueGenerator().generateNextLine();

    // Check if it's a prompt
    const hasPrompt = nextLine.prompt !== undefined;

    // IMPORTANT: Restore the state so we don't skip the actual advancement
    (this.getDialogueGenerator() as any).currPart = currentPart;
    (this.getDialogueGenerator() as any).currLineNum = currentLineNum;

    return { ...nextLine, hasPrompt };
  }

  public async showNextLine(resolve: () => void) {
    //Proposal: Only play sound if we are not skipping, to avoid spamming sounds when skipping
    if (!this.isSkipping) {
      GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);
    }
    //Proposal: Change the line below to the if condition above
    // GameGlobalAPI.getInstance().playSound(SoundAssets.dialogueAdvance.key);
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
    this.getInputManager().enableKeyboardInput(true);

    if (!line) {
      // clear keyboard listeners when dialogue ends
      //Proposal: Also clear the skipDialogue keyboard listener when dialogue ends
      this.getInputManager().clearKeyboardListeners([keyboardShortcuts.Next, keyboardShortcuts.SkipDialogue]);
      resolve();
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
