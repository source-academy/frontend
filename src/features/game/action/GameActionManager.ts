import { ItemId } from '../commons/CommonTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import GameManager from '../scenes/gameManager/GameManager';
import { mandatory } from '../utils/GameUtils';
import ActionConditionChecker from './GameActionConditionChecker';
import GameActionExecuter from './GameActionExecuter';
import { ActionCondition,GameAction } from './GameActionTypes';

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

  private getActionFromId = (actionId: ItemId) =>
    mandatory(this.actionMap.get(actionId)) as GameAction;
}
