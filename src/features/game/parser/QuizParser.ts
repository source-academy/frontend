import { GameItemType } from '../location/GameMapTypes';
import { Option, Question, Quiz } from '../quiz/GameQuizType';
import StringUtils from '../utils/StringUtils';
import DialogueParser from './DialogueParser';
import Parser from './Parser';
import SpeakerParser from './SpeakerParser';

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
        throw new Error('Parsing error: No quiz content found for quizId');
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
      questions[parseInt(key)] = this.createQuestion(value);
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
    if (questionText.length < 2) {
      throw new Error('Parsing error: Quiz missing question or answer');
    }
    const question: Question = {
      question: questionText[0],
      speaker: SpeakerParser.parse('@narrator'),
      answer: this.getQuizAnswer(questionText[1]),
      options: this.parseOptions(questionText.slice(2))
    };
    return question;
  }

  /**
   * This function parses a answer string and
   * converts it into Number.
   *
   * @param answer The string containing the correct answer of a question
   */
  private static getQuizAnswer(answer: string): number {
    const ans = answer.split(':');
    if (ans.length < 2 || Number.isNaN(parseInt(ans[1]))) {
      throw new Error('Parsing error: Invalid answer for Quiz');
    }
    return parseInt(ans[1]);
  }

  /**
   * This function parses options of a question and
   * store them in an array.
   *
   * @param optionsText An Array of string containing all options' content,
   * including option text and reactions
   */
  private static parseOptions(optionsText: string[]): Option[] {
    const optionsParagraph = StringUtils.splitToParagraph(optionsText);
    const options: Option[] = Array(optionsParagraph.length);
    optionsParagraph.forEach(([header, content]: [string, string[]], index) => {
      options[index] = this.createOption(content);
    });
    return options;
  }

  /**
   * This function creates an Option object.
   *
   * @param content An Array of string containing an option's content,
   * including option text and reaction
   * @param [noReaction=false] Indicates whether this option provides a reaction
   */
  private static createOption(content: string[], noReaction: boolean = false): Option {
    if (!content) {
      throw new Error('Parsing error: Quiz option not provided');
    }
    if (content.length <= 1) {
      noReaction = true;
    }
    const option: Option = {
      text: content[0],
      reaction: noReaction ? undefined : DialogueParser.parseQuizReaction(content.slice(1))
    };
    return option;
  }
}

const isInteger = (line: string) => new RegExp(/^[0-9]+$/).test(line);
