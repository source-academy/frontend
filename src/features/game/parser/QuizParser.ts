import { DialogueObject } from '../dialogue/GameDialogueTypes';
import { GameItemType } from '../location/GameMapTypes';
import { defaultReaction } from '../quiz/GameQuizConstants';
import { Option, Question, Quiz } from '../quiz/GameQuizType';
import StringUtils from '../utils/StringUtils';
import DialogueParser from './DialogueParser';
import Parser from './Parser';

/**
 * This class parses quizzes and creates Quiz Objects
 * which can be read by the Quiz Manager.
 */
export default class QuizParser {
  /**
   * This function reads the entire text under the "quizzes" heading,
   * converts quizzes listed underneath into Quiz entities,
   * and stores these quizzes in the game map.
   *
   * @param quizText the entire quiz text beneath quizzes heading
   */
  public static parse(quizText: string[]) {
    const quizParagraphs = StringUtils.splitToParagraph(quizText);
    quizParagraphs.forEach(([quizId, quizBody]: [string, string[]]) => {
      if (quizBody.length === 0) {
        console.error('No quiz content found for quizId');
        return;
      }
      this.parseQuiz(quizId, quizBody);
    });
  }

  /**
   * This function parses one quiz and stores it into the game map.
   *
   * @param quizId the string containing quiz Id
   * @param quizBody the body of the dialogue containing its questions and options
   */
  private static parseQuiz(quizId: string, quizBody: string[]) {
    Parser.validator.registerId(quizId);
    const rawQuestions: Map<string, string[]> = StringUtils.mapByHeader(quizBody, isInteger);
    const questions: Question[] = this.parseQuizQuestions(rawQuestions);
    const quiz: Quiz = { questions: questions };
    Parser.checkpoint.map.setItemInMap(GameItemType.quizzes, quizId, quiz);
  }

  /**
   * This function parses the quiz's questions,
   * converts each into a Question object,
   * and store in an array.
   *
   * @param map The map of raw questions that map from index to question body
   */
  private static parseQuizQuestions(map: Map<string, string[]>): Question[] {
    const questions: Question[] = new Array(map.size);
    map.forEach((value: string[], key: string) => {
      const question: Question = this.createQuestion(value);
      questions[parseInt(key)] = question;
    });
    return questions;
  }

  /**
   * This function parses a question and
   * create a Question object.
   *
   * @param questionText The text of a question body
   * containing question text, correct answer, and options
   */
  private static createQuestion(questionText: string[]): Question {
    const ans = this.getQuizAnswer(questionText[1]);
    const question: Question = {
      question: questionText[0],
      answer: ans,
      options: this.parseOptions(questionText.slice(2), ans)
    };
    return question;
  }

  /**
   * This function parses a answer string and
   * converts it into Number.
   *
   * @param answer The string containing the correct answer of a question
   */
  private static getQuizAnswer(answer: string): Number {
    return parseInt(answer.split(':')[1]);
  }

  /**
   * This function parses options of a question and
   * store them in an array.
   *
   * @param optionsText An Array of string containing all options' content,
   * including option text and reactions
   * @param answer The correct answer of the corresponding question
   */
  private static parseOptions(optionsText: string[], answer: Number): Option[] {
    const optionsParagraph = StringUtils.splitToParagraph(optionsText);
    const options: Option[] = Array(optionsParagraph.length);
    optionsParagraph.forEach(([header, content]: [string, string[]], index) => {
      options[index] = this.createOption(content, answer === index);
    });
    return options;
  }

  /**
   * This function creates an Option object.
   *
   * @param content An Array of string containing an option's content,
   * including option text and reaction
   * @param isCorrect Indicates whether this option is the correct answer
   * @param [defaultReaction=false] Indicates whether this option uses the default reaction
   */
  private static createOption(
    content: string[],
    isCorrect: boolean,
    defaultReaction: boolean = false
  ): Option {
    if (content.length <= 1) {
      defaultReaction = true;
    }
    const option: Option = {
      text: content[0],
      reaction: defaultReaction
        ? this.createDefaultReaction(isCorrect)
        : DialogueParser.parseQuizReaction(content.slice(1))
    };
    return option;
  }

  /**
   * This function creates a Dialogue object with
   * the default reactions defined in GamaQuizConstants
   *
   * @param isCorrect Indicates whether the correct or wrong reaction should be used
   */
  private static createDefaultReaction(isCorrect: boolean): DialogueObject {
    if (isCorrect) {
      return DialogueParser.parseQuizReaction(defaultReaction.correct);
    } else {
      return DialogueParser.parseQuizReaction(defaultReaction.wrong);
    }
  }
}

const isInteger = (line: string) => new RegExp(/^[0-9]+$/).test(line);