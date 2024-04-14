import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { GameStateStorage } from '../state/GameStateTypes';
import { ActionCondition } from './GameActionTypes';

/**
 * This class checks for whether if-conditions are satisfied,
 * to determine whether or not game actions will be played out.
 */
export default class ActionConditionChecker {
  /**
   * Checks whether all action conditions are met
   * @param actionConditions Array of action conditions
   * @returns {Promise<boolean>} True if all conditions are met
   */
  public static async checkAllConditionsSatisfied(actionConditions: ActionCondition[]) {
    const allConditions = await Promise.all(
      actionConditions.map(
        async actionCondition => await this.checkConditionSatisfied(actionCondition)
      )
    );
    return allConditions.every(condition => condition === true);
  }

  /**
   * Checks whether one action conditions is met
   * Also stubs the user state
   *
   * @param conditional The action condition
   * @returns {boolean} True if condition is met
   */
  public static async checkConditionSatisfied(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        return (
          (await GameGlobalAPI.getInstance().isInUserState(
            conditionParams.userStateType,
            conditionParams.id
          )) === boolean
        );
      case GameStateStorage.ChecklistState:
        return GameGlobalAPI.getInstance().isObjectiveComplete(conditionParams.id) === boolean;
      case GameStateStorage.TasklistState:
        return GameGlobalAPI.getInstance().isTaskComplete(conditionParams.id) === boolean;
      case GameStateStorage.AttemptedQuizState:
        return GameGlobalAPI.getInstance().isQuizAttempted(conditionParams.id) === boolean;
      case GameStateStorage.PassedQuizState:
        return GameGlobalAPI.getInstance().isQuizComplete(conditionParams.id) === boolean;
      case GameStateStorage.QuizScoreState:
        return (
          GameGlobalAPI.getInstance().getQuizScore(conditionParams.id) >=
            parseInt(conditionParams.score) ===
          boolean
        );
      default:
        return true;
    }
  }
}
