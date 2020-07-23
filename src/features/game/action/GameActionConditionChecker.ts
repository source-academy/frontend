import { promptWithChoices } from '../effects/Prompt';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame, { GameType } from '../SourceAcademyGame';
import { GameStateStorage } from '../state/GameStateTypes';
import StringUtils from '../utils/StringUtils';
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
        if (SourceAcademyGame.getInstance().isGameType(GameType.Simulator)) {
          const response = await promptWithChoices(
            GameGlobalAPI.getInstance().getGameManager(),
            `${StringUtils.capitalize(conditionParams.userStateList)} ${conditionParams.id}?`,
            ['Yes', 'No']
          );
          const isAnswerYes = response === 0;
          return isAnswerYes === boolean;
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
