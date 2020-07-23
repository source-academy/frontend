import { ActionCondition } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';
import ParserConverter from './ParserConverter';
import { GameAttr } from './ParserValidator';

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
        return {
          state: GameStateStorage.ChecklistState,
          conditionParams: { id: Parser.validator.assertAttr(GameAttr.objectives, condParams[0]) },
          boolean: !hasExclamation
        };

      case GameStateStorage.UserState:
        return {
          state: GameStateStorage.UserState,
          conditionParams: {
            userStateList: condParams[0],
            id: condParams[1]
          },
          boolean: !hasExclamation
        };
      default:
        throw new Error('Parsing error: Invalid condition param');
    }
  }
}
