import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Question } from './GameQuizType';
import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { Layer } from '../layer/GameLayerTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos, HexColor } from '../utils/StyleUtils';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from '../effects/FlyEffect';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
import GameQuizReactionManager from './GameQuizReactionManager';
import { QuizConstants, textStyle, quizOptStyle } from './GameQuizConstants';

export default class QuizManager {
  private reactionManager? : GameQuizReactionManager;
  
  public async showQuiz(quizId:ItemId) {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId);
    const quizResult: boolean[] = new Array<boolean>(quiz.questions.length);
    for (let i = 0; i < quiz.questions.length; i++ ) {
        const isCorrect = await this.showQuizQuestion(GameGlobalAPI.getInstance().getGameManager(), quiz.questions[i]);
        console.log("check the question displayed: " + isCorrect);
        quizResult[i] = isCorrect;
    }
    console.log(quiz.result);
    quiz.result = quizResult;
    console.log(quiz.result);
    await this.showResult(quiz.result);
  }

  //Display the specific quiz question
  public async showQuizQuestion(scene: Phaser.Scene, question: Question){
        
      console.log(GameGlobalAPI.getInstance().getGameManager().getPhaseManager().isCurrentPhaseTerminal());
      const choices = question.options;
      const quizContainer = new Phaser.GameObjects.Container(scene, 0, 0);

      const quizPartitions = Math.ceil(choices.length / 5);
      const quizHeight = choices.length > 5 ? 5 : choices.length;

      const header = new Phaser.GameObjects.Text(
        scene,
        screenSize.x - QuizConstants.textPad,
        QuizConstants.y,
        question.question,
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

      quizContainer.add([quizBg, quizHeaderBg, header]);

      const buttonPositions = calcListFormatPos({
        numOfItems: choices.length,
        xSpacing: 0,
        ySpacing: QuizConstants.yInterval
      });

      GameGlobalAPI.getInstance().addToLayer(Layer.UI, quizContainer);

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
                const isCorrect = (index === question.answer);
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
        );});

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

      await sleep(rightSideExitTweenProps.duration);
      fadeAndDestroy(scene, quizContainer, { fadeDuration: Constants.fadeDuration });
      return response;
  }

  private async showReaction(reaction: DialogueObject) {
    this.reactionManager = new GameQuizReactionManager(reaction);
    await this.reactionManager.showReaction();
  }

  private async showResult(result: boolean[]) {
    const numOfCorrect = result.reduce((accumulator, current) => accumulator + (current ? 1 : 0), 0);
    const line = numOfCorrect <= 1 ? `${ numOfCorrect } question` : `${ numOfCorrect } questions`;
    const resultObject: DialogueObject = new Map([
      ["0", [{line: `You got ${ line } correct!`}]]
    ]);
    await this.showReaction(resultObject);
  }
  // private showQuestion(question: Question) {
  //   console.log(question.question);
  //   console.log(question.answer);
  //   question.options.forEach(option => {
  //     this.showOption(option);
  //   });
  // }

  // private showOption(option: Option) {
  //   console.log(option.text);
  //   option.reaction.forEach((value: DialogueLine[]) => this.showReaction(value));
  // }

  // private showReaction(reaction: DialogueLine[]) {
  //   reaction.forEach((line: DialogueLine) => console.log(line.line));
  // }
}
