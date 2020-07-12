import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import GameActionExecuter from './GameActionExecuter';
import ActionConditionChecker from './GameActionConditionChecker';

import { GameAction, ActionCondition } from './GameActionTypes';
import { ItemId } from '../commons/CommonTypes';

export default class GameActionManager {
  private actionMap: Map<ItemId, GameAction>;

  constructor() {
    this.actionMap = new Map<ItemId, GameAction>();
  }

  public initialise(gameManager: GameManager) {
    this.actionMap = gameManager.getCurrentCheckpoint().map.getActions();
  }

  public async processGameActions(actionIds?: ItemId[]): Promise<void> {
    if (!actionIds) return;
    for (const actionId of actionIds) {
      await this.processGameAction(actionId);
    }
    await GameGlobalAPI.getInstance().saveGame();
  }

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
    }
  }

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

  private getActionFromId(actionId: ItemId): GameAction {
    const action = this.actionMap.get(actionId);
    if (!action) {
      throw new Error('Action id was not found');
    }
    return action;
  }
}
