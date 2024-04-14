import { ActionCondition } from '../action/GameActionTypes';
import { GameItemType } from '../location/GameMapTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';
import ParserConverter from './ParserConverter';
import { GameEntityType } from './ParserValidator';

/**
 * This parser is in charge of parsing conditionals
 */
export default class ConditionParser {
  /**
   * This function creates an ActionCondition object, given a condition string
   *
   * @param conditionDetails A conditional string such as "!if userstate.assessments.301"
   * @returns {ActionCondition} encapsulating the information on the conditional
   */
  public static parse(conditionDetails: string): ActionCondition {
    const hasExclamation = conditionDetails[0] === '!';
    if (hasExclamation) {
      conditionDetails = conditionDetails.slice(1);
    }
    const [gameStateStorage, ...condParams] = StringUtils.splitByChar(conditionDetails, '.');
    switch (ParserConverter.stringToGameStateStorage(gameStateStorage)) {
      case GameStateStorage.ChecklistState:
        Parser.validator.assertEntityType(GameEntityType.objectives, condParams[0]);
        return {
          state: GameStateStorage.ChecklistState,
          conditionParams: {
            id: condParams[0]
          },
          boolean: !hasExclamation
        };

      case GameStateStorage.TasklistState:
        Parser.validator.assertEntityType(GameEntityType.tasks, condParams[0]);
        return {
          state: GameStateStorage.TasklistState,
          conditionParams: {
            id: condParams[0]
          },
          boolean: !hasExclamation
        };

      case GameStateStorage.UserState:
        return {
          state: GameStateStorage.UserState,
          conditionParams: {
            userStateType: ParserConverter.stringToUserStateType(condParams[0]),
            id: condParams[1]
          },
          boolean: !hasExclamation
        };

      case GameStateStorage.AttemptedQuizState:
        Parser.validator.assertItemType(GameItemType.quizzes, condParams[0]);
        return {
          state: GameStateStorage.AttemptedQuizState,
          conditionParams: {
            id: condParams[0]
          },
          boolean: !hasExclamation
        };

      case GameStateStorage.PassedQuizState:
        Parser.validator.assertItemType(GameItemType.quizzes, condParams[0]);
        return {
          state: GameStateStorage.PassedQuizState,
          conditionParams: {
            id: condParams[0]
          },
          boolean: !hasExclamation
        };

      case GameStateStorage.QuizScoreState:
        Parser.validator.assertItemType(GameItemType.quizzes, condParams[0]);
        if (Number.isNaN(parseInt(condParams[1]))) {
          throw new Error('Parsing error: quiz score condition requires number as second param');
        }
        return {
          state: GameStateStorage.QuizScoreState,
          conditionParams: {
            id: condParams[0],
            score: condParams[1]
          },
          boolean: !hasExclamation
        };

      default:
        throw new Error('Parsing error: Invalid condition param');
    }
  }
}
