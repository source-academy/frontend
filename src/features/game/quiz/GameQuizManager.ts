import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Question } from './GameQuizType';
import FontAssets from '../assets/FontAssets';
import ImageAssets from '../assets/ImageAssets';
import SoundAssets from '../assets/SoundAssets';
import { Constants, screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { Layer } from '../layer/GameLayerTypes';
import SourceAcademyGame from '../SourceAcademyGame';
import { createButton } from '../utils/ButtonUtils';
import { sleep } from '../utils/GameUtils';
import { calcListFormatPos, Color, HexColor } from '../utils/StyleUtils';
import { fadeAndDestroy } from '../effects/FadeEffect';
import { rightSideEntryTweenProps, rightSideExitTweenProps } from '../effects/FlyEffect';
import { DialogueObject } from '../dialogue/GameDialogueTypes';
import GameQuizReactionManager from './GameQuizReactionManager';

export default class QuizManager {
  private reactionManager? : GameQuizReactionManager;
  QuizConstants = {
    textPad: 20,
    textConfig: { x: 15, y: -15, oriX: 0.5, oriY: 0.5 },
    y: 100,
    width: 450,
    yInterval: 100
  };
  
  textStyle = {
    fontFamily: 'Verdana',
    fontSize: '20px',
    fill: Color.offWhite,
    align: 'right',
    lineSpacing: 10,
    wordWrap: { width: this.QuizConstants.width - this.QuizConstants.textPad * 2 }
  };
  
  quizOptStyle: BitmapFontStyle = {
    key: FontAssets.zektonFont.key,
    size: 25,
    align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
  };
  // Print everything. To test if the quiz parser parses correctly.
  public async showQuiz(quizId:ItemId) {
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId); // get a quiz
   

    for (var i = 0; i < quiz.questions.length; i++ ) {
        const res = await this.showQuizQuestion(GameGlobalAPI.getInstance().getGameManager(), quiz.questions[i]);
        console.log("check the question displayed: " + res);
    }
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
        screenSize.x - this.QuizConstants.textPad,
        this.QuizConstants.y,
        question.question,
        this.textStyle
      ).setOrigin(1.0, 0.0);
      const quizHeaderBg = new Phaser.GameObjects.Rectangle(
        scene,
        screenSize.x,
        this.QuizConstants.y - this.QuizConstants.textPad,
        this.QuizConstants.width * quizPartitions,
        header.getBounds().bottom * 0.5 + this.QuizConstants.textPad,
        HexColor.darkBlue,
        0.8
      ).setOrigin(1.0, 0.0);
      const quizBg = new Phaser.GameObjects.Rectangle(
        scene,
        screenSize.x,
        this.QuizConstants.y - this.QuizConstants.textPad,
        this.QuizConstants.width * quizPartitions,
        quizHeaderBg.getBounds().bottom * 0.5 + (quizHeight + 0.5) * this.QuizConstants.yInterval,
        HexColor.lightBlue,
        0.2
      ).setOrigin(1.0, 0.0);

      quizContainer.add([quizBg, quizHeaderBg, header]);

      const buttonPositions = calcListFormatPos({
        numOfItems: choices.length,
        xSpacing: 0,
        ySpacing: this.QuizConstants.yInterval
      });

      GameGlobalAPI.getInstance().addToLayer(Layer.UI, quizContainer);

      const activateQuizContainer: Promise<any> = new Promise(resolve => {
        quizContainer.add(
          choices.map((response, index) =>
            createButton(scene, {
              assetKey: ImageAssets.mediumButton.key,
              message: response.text,
              textConfig: this.QuizConstants.textConfig,
              bitMapTextStyle: this.quizOptStyle,
              onUp: () => {
                quizContainer.destroy();
                if (index == question.answer) {
                resolve(this.showReaction(scene, question, choices[index].reaction, true)); 
              } else {
                resolve(this.showReaction(scene, question, choices[index].reaction, false));
              }
              }
            }).setPosition(
              screenSize.x -
                this.QuizConstants.width / 2 -
                this.QuizConstants.width * (quizPartitions - Math.floor(index / 5) - 1),
              (buttonPositions[index][1] % (5 * this.QuizConstants.yInterval)) +
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

  private async showReaction(scene: Phaser.Scene, question: Question, reaction: DialogueObject, status: boolean) {
    console.log("correct answer: " + status);
    await this.showResult(scene, reaction);
  }


  private async showResult(scene: Phaser.Scene, reaction: DialogueObject) {
    this.reactionManager = new GameQuizReactionManager(reaction);
    await this.reactionManager.showReaction();
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
