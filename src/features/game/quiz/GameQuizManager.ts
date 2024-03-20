import { ItemId } from '../commons/CommonTypes';
import { DialogueLine } from '../dialogue/GameDialogueTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Option, Question } from './GameQuizType';

export default class QuizManager {
  // Print everything. To test if the quiz parser parses correctly.
  public showQuiz(quizId: ItemId) {
    console.log('A quiz is shown');
    const quiz = GameGlobalAPI.getInstance().getQuizById(quizId); // get a quiz
    const questions = quiz.questions;
    questions.forEach((value: Question) => {
      this.showQuestion(value);
    });
  }

  private showQuestion(question: Question) {
    console.log(question.question);
    console.log(question.answer);
    question.options.forEach(option => {
      this.showOption(option);
    });
  }

  private showOption(option: Option) {
    console.log(option.text);
    option.reaction.forEach((value: DialogueLine[]) => this.showReaction(value));
  }

  private showReaction(reaction: DialogueLine[]) {
    reaction.forEach((line: DialogueLine) => console.log(line.line));
  }
}
