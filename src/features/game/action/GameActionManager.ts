import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import ActionConditionChecker from './GameActionConditionChecker';
import GameActionExecuter from './GameActionExecuter';
import { ActionCondition } from './GameActionTypes';

/**
 * This class manages all game actions, and is called whenever
 * entities need to perform actions.
 */
export default class GameActionManager {
  /**
   * Executes an array of state-change actions
   * to bring game state same as last player's progress
   *
   * @param actionIds ids of the actions
   */
  public async fastForwardGameActions(actionIds?: ItemId[]): Promise<void> {
    if (!actionIds) return;
    for (const actionId of actionIds) {
      const { actionType, actionParams } = GameGlobalAPI.getInstance().getActionById(actionId);
      await GameActionExecuter.executeGameAction(actionType, actionParams);
    }
  }

  /**
   * Process an array of actions, denoted by their IDs.
   *
   * NOTE: Saves the game after all the actions are executed.
   *
   * @param actionIds ids of the actions
   */
  public async processGameActions(actionIds?: ItemId[]): Promise<void> {
    if (!actionIds) return;
    for (const actionId of actionIds) {
      await this.processGameAction(actionId);
    }
    await GameGlobalAPI.getInstance().saveGame();
  }

  /**
   * Process an action, denoted by its ID.
   *
   * @param actionId id of the action
   */
  public async processGameAction(actionId: ItemId) {
    const { actionType, actionParams, actionConditions, isRepeatable, interactionId } =
      GameGlobalAPI.getInstance().getActionById(actionId);

    if (await this.checkCanPlayAction(isRepeatable, interactionId, actionConditions)) {
      await GameActionExecuter.executeGameAction(actionType, actionParams);
      if (GameActionExecuter.isStateChangeAction(actionType)) {
        GameGlobalAPI.getInstance().triggerStateChangeAction(actionId);
      }
      GameGlobalAPI.getInstance().triggerInteraction(actionId);
    }
  }

  /**
   * Check whether an action is playable.
   *
   * An action is playable if:
   *  - Has not been triggered & has all of its condition fulfilled
   *  - Has been triggered, but repeatable & & has all of its condition fulfilled
   *
   * @param isRepeatable whether the action is repeatable
   * @param interactionId id of the interaction
   * @param actionConditions condition to be fulfilled to play the action
   */
  private async checkCanPlayAction(
    isRepeatable: boolean,
    interactionId: string,
    actionConditions: ActionCondition[]
  ) {
    return (
      (isRepeatable || !GameGlobalAPI.getInstance().hasTriggeredInteraction(interactionId)) &&
      (await ActionConditionChecker.checkAllConditionsSatisfied(actionConditions))
    );
  }
}
