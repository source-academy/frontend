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
   * @param conditional The action condition
   * @returns {Promise<boolean>} True if condition is met
   */
  private static async checkConditionSatisfied(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        switch (conditionParams.listName) {
          case 'collectibles':
            return GameGlobalAPI.getInstance().hasCollectible(conditionParams.id) === boolean;
          case 'achievements':
            return (
              (await GameGlobalAPI.getInstance().isAchievementUnlocked(conditionParams.id)) ===
              boolean
            );
          case 'assessments':
            return (
              (await GameGlobalAPI.getInstance().isAssessmentComplete(conditionParams.id)) ===
              boolean
            );
        }
        return false;

      case GameStateStorage.ChecklistState:
        return GameGlobalAPI.getInstance().isObjectiveComplete(conditionParams.id) === boolean;
      default:
        return true;
    }
  }
}
