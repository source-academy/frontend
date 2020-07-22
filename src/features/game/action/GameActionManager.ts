import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import { mandatory } from '../utils/GameUtils';
import ActionConditionChecker from './GameActionConditionChecker';
import GameActionExecuter from './GameActionExecuter';
import { ActionCondition, GameAction } from './GameActionTypes';

/**
 * This class manages all game actions, and is called whenever
 * entities need to perform actions.
 */
export default class GameActionManager {
  private actionMap: Map<ItemId, GameAction>;

  constructor() {
    this.actionMap = new Map<ItemId, GameAction>();
  }

  public initialise(gameManager: GameManager) {
    this.actionMap = gameManager.getStateManager().getGameMap().getActions();
  }

  /**
   * Process an array of actions, denoted by their IDs,
   * but only replays those actions that have no visible effects
   *
   * @param actionIds ids of the actions
   */
  public async fastForwardGameActions(actionIds?: ItemId[]): Promise<void> {
    if (!actionIds) return;
    for (const actionId of actionIds) {
      const { actionType, actionParams } = this.getActionFromId(actionId);
      await GameActionExecuter.executeGameAction(actionType, actionParams, true);
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
    const {
      actionType,
      actionParams,
      actionConditions,
      isRepeatable,
      interactionId
    } = this.getActionFromId(actionId);
    if (await this.checkCanPlayAction(isRepeatable, interactionId, actionConditions)) {
      await GameActionExecuter.executeGameAction(actionType, actionParams);
      GameGlobalAPI.getInstance().triggerInteraction(actionId);
      GameGlobalAPI.getInstance().triggerAction(actionId);
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

  private getActionFromId = (actionId: ItemId) => mandatory(this.actionMap.get(actionId));
}
