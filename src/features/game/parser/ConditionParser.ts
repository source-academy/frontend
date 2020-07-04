import ParserConverter from './ParserConverter';
import StringUtils from '../utils/StringUtils';
import { ActionCondition } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';

export default class ConditionParser {
  public static parse(conditionDetails: string): ActionCondition {
    const [gameStateStorage, ...condParams] = StringUtils.splitByChar(conditionDetails, '.');
    switch (ParserConverter.stringToGameStateStorage(gameStateStorage)) {
      case GameStateStorage.ChecklistState:
        return {
          state: GameStateStorage.ChecklistState,
          conditionParams: { id: condParams[0] }
        };

      case GameStateStorage.UserState:
        return {
          state: GameStateStorage.UserState,
          conditionParams: {
            listName: condParams[0],
            id: condParams[1]
          }
        };
      default:
        throw new Error('Parsing error: Invalid condition param');
    }
  }
}
