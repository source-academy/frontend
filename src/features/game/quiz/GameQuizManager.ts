import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Question, QuizResult } from './GameQuizType';
import { QuizConstants, textStyle, quizOptStyle, questionTextStyle } from './GameQuizConstants';
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
import { displayNotification } from '../effects/Notification';
import GameQuizOutcomeManager from './GameQuizOutcome';
import { ImproveMent, allCorrect } from './GameQuizConstants';
import { createDialogueBox, createTypewriter } from '../dialogue/GameDialogueHelper';

export default class QuizManager {
  private reactionManager? : GameQuizReactionManager;

  // Print everything. To test if the quiz parser parses correctly.
  public async showQuiz(quizId:ItemId) {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId); // get a quiz
    const quizResult : QuizResult = {
      numberOfQuestions : 0,
      allCorrect : true,
    }; 

    for (var i = 0; i < quiz.questions.length; i++ ) {
        await this.showQuizQuestion(GameGlobalAPI.getInstance().getGameManager(), quiz.questions[i], quizResult);
        //console.log("check the question displayed: " + res);
    }

    await this.displayFinalResult(quizResult);
  }

  //Display the specific quiz question
  public async showQuizQuestion(scene: Phaser.Scene, question: Question, quizResult : QuizResult){
      const choices = question.options;
      const quizContainer = new Phaser.GameObjects.Container(scene, 0, 0);

      const quizPartitions = Math.ceil(choices.length / 5);
      const quizHeight = choices.length;

      //create quiz box contains quiz questions
      const quizQuestionBox = createDialogueBox(scene);

      const quizQuestionWriter = createTypewriter(scene, questionTextStyle);

      quizQuestionWriter.changeLine(question.question);

      const header = new Phaser.GameObjects.Text(
        scene,
        screenSize.x / 2 - QuizConstants.textPad,
        QuizConstants.y,
        "options" ,
        textStyle
      ).setOrigin(1.0, 0.0);
      
      const quizHeaderBg = new Phaser.GameObjects.Rectangle(
        scene,
        screenSize.x / 2,
        QuizConstants.y - QuizConstants.textPad,
        QuizConstants.width * quizPartitions,
        header.getBounds().bottom * 0.5 + QuizConstants.textPad,
        HexColor.darkBlue,
        0.8
      ).setOrigin(1.0, 0.0);
      
      const quizBg = new Phaser.GameObjects.Rectangle(
        scene,
        screenSize.x / 2,
        QuizConstants.y - QuizConstants.textPad,
        QuizConstants.width * quizPartitions,
        quizHeaderBg.getBounds().bottom * 0.5 + (quizHeight + 0.5) * QuizConstants.yInterval,
        HexColor.lightBlue,
        0.2
      ).setOrigin(1.0, 0.0);

      quizContainer.add([quizBg, quizHeaderBg, header, 
            quizQuestionBox, quizQuestionWriter.container]);

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
              onUp: () => {
                quizContainer.destroy();
                if (index === question.answer) {
                  quizResult.numberOfQuestions += 1;
                  resolve(this.showReaction(scene, question, choices[index].reaction, quizResult)); 
              } else {
                  quizResult.allCorrect = false;
                  resolve(this.showReaction(scene, question, choices[index].reaction, quizResult));
              }
              }
            }).setPosition(
                screenSize.x / 2 -
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

        //await sleep(rightSideExitTweenProps.duration);
        fadeAndDestroy(scene, quizContainer, { fadeDuration: Constants.fadeDuration });
        return response;
  }

  private async showReaction(scene: Phaser.Scene, question: Question, reaction: DialogueObject, status: QuizResult) {
    console.log("the number of correct answer: " + status.numberOfQuestions);
    await this.showResult(scene, reaction);
    //await displayNotification(GameGlobalAPI.getInstance().getGameManager(), "number of correct questions: " + status.numberOfQuestions);
  }


  private async showResult(scene: Phaser.Scene, reaction: DialogueObject) {
    this.reactionManager = new GameQuizReactionManager(reaction);
    await this.reactionManager.showReaction();
  }

  private async displayFinalResult(quizResult : QuizResult) {
    await displayNotification(GameGlobalAPI.getInstance().getGameManager(), "scores: " + quizResult.numberOfQuestions);
    const outComeManager : GameQuizOutcomeManager = 
      quizResult.allCorrect ? new GameQuizOutcomeManager(allCorrect) 
      : new GameQuizOutcomeManager(ImproveMent);
    await outComeManager.showReaction();
  }


}
