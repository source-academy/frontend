import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { createDialogueBox, createTypewriter } from '../dialogue/GameDialogueHelper';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from '../effects/FlyEffect';
import { promptWithChoices } from '../effects/Prompt';
import { Layer } from '../layer/GameLayerTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos, HexColor } from '../utils/StyleUtils';
import {
  questionPrompt,
  questionTextStyle,
  QuizConstants,
  quizOptStyle,
  quizTextStyle,
  startPrompt
} from './GameQuizConstants';
import GameQuizReactionManager from './GameQuizReactionManager';
import { Question } from './GameQuizType';

export default class QuizManager {
  private reactionManager?: GameQuizReactionManager;

  /**
   * Rendering the quiz section inside a dialogue.
   *
   * @param quizId The Id of quiz that users will attempt inside a dialogue.
   */
  public async showQuiz(quizId: ItemId) {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId);
    const numOfQuestions = quiz.questions.length;
    if (numOfQuestions === 0) {
      return;
    }
    if (!(await this.showStartPrompt(GameGlobalAPI.getInstance().getGameManager()))) {
      await GameGlobalAPI.getInstance().showNextLine(() => {});
      return;
    }
    await GameGlobalAPI.getInstance().getGameManager().getDialogueManager().hideAll();
    let numOfCorrect = 0;
    for (let i = 0; i < numOfQuestions; i++) {
      numOfCorrect += await this.showQuizQuestion(
        GameGlobalAPI.getInstance().getGameManager(),
        quiz.questions[i]
      );
    }
    GameGlobalAPI.getInstance().setQuizScore(quizId, numOfCorrect);
    await GameGlobalAPI.getInstance().showNextLine(() => {});
    await GameGlobalAPI.getInstance().getGameManager().getDialogueManager().showAll();
  }

  /**
   * Display a prompt before a quiz starts.
   * Player can choose to proceed and do the quiz,
   * or to not do the quiz and exit.
   *
   * @param scene The Game Manager.
   * @returns true if the player chooses to start the quiz.
   */
  private async showStartPrompt(scene: Phaser.Scene) {
    const response = await promptWithChoices(scene, startPrompt.text, startPrompt.options);
    return response === 0;
  }

  /**
   * Display the specific quiz question.
   *
   * @param scene The game manager.
   * @param question The question to be displayed.
   */
  public async showQuizQuestion(scene: Phaser.Scene, question: Question) {
    const choices = question.options;
    const quizContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    const selfQuestionPrompt = question.prompt ?? questionPrompt;
    const quizPartitions = Math.ceil(choices.length / 5);
    const quizHeight = choices.length;

    //Create quiz box contains quiz questions
    const quizQuestionBox = createDialogueBox(scene);

    //Create text writer to display quiz questions
    const quizQuestionWriter = createTypewriter(scene, questionTextStyle);
    const lineWithName = question.question.replace('{name}', this.getUsername());
    quizQuestionWriter.changeLine(lineWithName);

    GameGlobalAPI.getInstance().storeDialogueLine(lineWithName, question.speaker);

    //Generate UI components for quizzes
    const header = new Phaser.GameObjects.Text(
      scene,
      screenSize.x - QuizConstants.textPad,
      QuizConstants.y,
      selfQuestionPrompt,
      quizTextStyle
    ).setOrigin(1.0, 0.0);

    const quizHeaderBg = new Phaser.GameObjects.Rectangle(
      scene,
      screenSize.x,
      QuizConstants.y - QuizConstants.textPad,
      QuizConstants.width * quizPartitions,
      header.getBounds().bottom * 0.5 + QuizConstants.textPad,
      HexColor.darkBlue,
      0.8
    ).setOrigin(1.0, 0.0);

    const quizBg = new Phaser.GameObjects.Rectangle(
      scene,
      screenSize.x,
      QuizConstants.y - QuizConstants.textPad,
      QuizConstants.width * quizPartitions,
      quizHeaderBg.getBounds().bottom * 0.5 + (quizHeight + 0.5) * QuizConstants.yInterval,
      HexColor.lightBlue,
      0.2
    ).setOrigin(1.0, 0.0);

    quizContainer.add([
      quizBg,
      quizHeaderBg,
      header,
      quizQuestionBox,
      quizQuestionWriter.container
    ]);

    const buttonPositions = calcListFormatPos({
      numOfItems: choices.length,
      xSpacing: 0,
      ySpacing: QuizConstants.yInterval
    });

    GameGlobalAPI.getInstance().addToLayer(Layer.Dialogue, quizContainer);

    //Create options for users to select
    const activateQuizContainer: Promise<any> = new Promise(resolve => {
      quizContainer.add(
        choices.map((response, index) =>
          createButton(scene, {
            assetKey: ImageAssets.mediumButton.key,
            message: response.text,
            textConfig: QuizConstants.textConfig,
            bitMapTextStyle: quizOptStyle,
            onUp: async () => {
              quizContainer.destroy();
              const isCorrect = index === question.answer ? 1 : 0;
              if (response.reaction) {
                await this.showReaction(response.reaction);
              }
              resolve(isCorrect);
            }
          }).setPosition(
            screenSize.x -
              QuizConstants.width / 2 -
              QuizConstants.width * (quizPartitions - Math.floor(index / 5) - 1),
            (buttonPositions[index][1] % (5 * QuizConstants.yInterval)) +
              quizHeaderBg.getBounds().bottom +
              QuizConstants.optionsYOffSet
          )
        )
      );
    });

    const response = await activateQuizContainer;

    // Animate in
    quizContainer.setPosition(screenSize.x, 0);
    SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifEnter.key);
    scene.add.tween({
      targets: quizContainer,
      alpha: 1,
      ...rightSideEntryTweenProps
    });
    await sleep(rightSideEntryTweenProps.duration);

    // Animate out
    SourceAcademyGame.getInstance().getSoundManager().playSound(SoundAssets.notifExit.key);
    scene.add.tween({
      targets: quizContainer,
      alpha: 1,
      ...rightSideExitTweenProps
    });

    fadeAndDestroy(scene, quizContainer, { fadeDuration: Constants.fadeDuration });
    return response;
  }

  /**
   * Display the reaction after users selecting an option.
   *
   * @param reaction The reaction to be displayed.
   */
  private async showReaction(reaction: DialogueObject) {
    this.reactionManager = new GameQuizReactionManager(reaction);
    await this.reactionManager.showReaction();
  }

  /**
   * Get the number of questions of a quiz.
   *
   * @param quizId The Id of quiz.
   */
  public getNumOfQns(quizId: ItemId): number {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId);
    return quiz.questions.length;
  }

  private getUsername = () => SourceAcademyGame.getInstance().getAccountInfo().name;
}
