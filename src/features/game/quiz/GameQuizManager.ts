import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { SpeakerDetail } from '../character/GameCharacterTypes';
import { Constants, screenSize } from '../commons/CommonConstants';
import { ItemId } from '../commons/CommonTypes';
import { createDialogueBox, createTypewriter } from '../dialogue/GameDialogueHelper';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from '../effects/FlyEffect';
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
  resultMsg,
  textStyle
} from './GameQuizConstants';
import GameQuizReactionManager from './GameQuizReactionManager';
import { Question } from './GameQuizType';

export default class QuizManager {
  private reactionManager?: GameQuizReactionManager;

  /**
   * rendering the quiz section inside a dialogue
   * @param quizId the Id of quiz that users will attempt inside a dialogye
   */
  public async showQuiz(quizId: ItemId) {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId);
    const numOfQns = quiz.questions.length;
    if (numOfQns === 0) {
      return;
    }
    let numOfCorrect = 0;
    for (let i = 0; i < numOfQns; i++) {
      numOfCorrect += await this.showQuizQuestion(
        GameGlobalAPI.getInstance().getGameManager(),
        quiz.questions[i]
      );
    }
    GameGlobalAPI.getInstance().attemptQuiz(quizId);
    if (numOfCorrect === numOfQns) GameGlobalAPI.getInstance().completeQuiz(quizId);
    await this.showResult(numOfQns, numOfCorrect, quiz.questions[0].speaker);
  }

  //Display the specific quiz question
  public async showQuizQuestion(scene: Phaser.Scene, question: Question) {
    const choices = question.options;
    const quizContainer = new Phaser.GameObjects.Container(scene, 0, 0);

    const quizPartitions = Math.ceil(choices.length / 5);
    const quizHeight = choices.length;

    //Create quiz box contains quiz questions
    const quizQuestionBox = createDialogueBox(scene);

    //Create text writer to display quiz questions
    const quizQuestionWriter = createTypewriter(scene, questionTextStyle);
    quizQuestionWriter.changeLine(question.question);

    GameGlobalAPI.getInstance().storeDialogueLine(question.question, question.speaker);

    //Generate UI components for quizzes
    const header = new Phaser.GameObjects.Text(
      scene,
      screenSize.x - QuizConstants.textPad,
      QuizConstants.y,
      questionPrompt,
      textStyle
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
              75
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

    //await sleep(rightSideExitTweenProps.duration);
    fadeAndDestroy(scene, quizContainer, { fadeDuration: Constants.fadeDuration });
    return response;
  }

  /**
   * Display the reaction after users selecting an option
   * @param reaction the reaction will be displayed based on the choice of users
   *
   */
  private async showReaction(reaction: DialogueObject) {
    this.reactionManager = new GameQuizReactionManager(reaction);
    await this.reactionManager.showReaction();
  }

  /**
   * Show the final score of the quiz as a quiz reaction.
   * @param numOfQns The number of questions of the quiz.
   * @param numOfCorrect The number of correctly answered questions.
   */
  private async showResult(numOfQns: number, numOfCorrect: number, speaker: SpeakerDetail) {
    await this.showReaction(this.makeResultMsg(numOfQns, numOfCorrect, speaker));
  }

  /**
   * Create DialogueObject containing the message of quiz score.
   * @param numOfQns The number of questions of the quiz.
   * @param numOfCorrect The number of correctly answered questions.
   * @returns A DialogueObject containing the message of quiz score.
   */
  private makeResultMsg(
    numOfQns: number,
    numOfCorrect: number,
    speaker: SpeakerDetail
  ): DialogueObject {
    let line = `You got ${numOfCorrect} out of ${numOfQns} questions correct. `;
    line += numOfCorrect === numOfQns ? resultMsg.allCorrect : resultMsg.notAllCorrect;
    return new Map([['0', [{ line: line, speakerDetail: speaker }]]]);
  }
}
