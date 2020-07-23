import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { GameStateStorage } from '../state/GameStateTypes';
import { ActionCondition } from './GameActionTypes';

/**
 * This class checks for whether if-conditions are satisfied,
 * to determine whether or not game actions will be played out.
 */
export default class ActionConditionChecker {
  /**
   * Checks whether one action conditions is met
   * Also stubs the user state
   *
   * @param conditional The action condition
   * @returns {boolean} True if condition is met
   */
  public static checkConditionSatisfied(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
          return (
            window.confirm(
              `Does user have ${conditionParams.userStateList} ${conditionParams.id}?`
            ) === boolean
          );
        }
        switch (conditionParams.userStateList) {
          case 'collectibles':
            return GameGlobalAPI.getInstance().hasCollectible(conditionParams.id) === boolean;
          case 'achievements':
            return GameGlobalAPI.getInstance().hasAchievement(conditionParams.id) === boolean;
          case 'assessments':
            return GameGlobalAPI.getInstance().hasAssessment(conditionParams.id) === boolean;
        }
        return true;
      case GameStateStorage.ChecklistState:
        return GameGlobalAPI.getInstance().isObjectiveComplete(conditionParams.id) === boolean;
      default:
        return true;
    }
  }
}
