import { ActionCondition } from './GameActionTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { GameStateStorage } from '../state/GameStateTypes';

export default class ActionConditionChecker {
  public static async checkAllConditionsSatisfied(actionConditions: ActionCondition[]) {
    const allConditions = await Promise.all(
      actionConditions.map(
        async actionCondition => await this.checkConditionSatisfied(actionCondition)
      )
    );
    return allConditions.every(condition => condition === true);
  }

  private static async checkConditionSatisfied(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        return (
          (await GameGlobalAPI.getInstance().existsInUserStateList(
            conditionParams.listName,
            conditionParams.id
          )) === boolean
        );
      case GameStateStorage.ChecklistState:
        return GameGlobalAPI.getInstance().isObjectiveComplete(conditionParams.id) === boolean;
      default:
        return true;
    }
  }
}
