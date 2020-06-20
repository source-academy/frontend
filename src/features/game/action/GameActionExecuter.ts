import { GameActionType, GameAction, ActionCondition } from './GameActionTypes';
import GameActionManager from './GameActionManager';
import { GameStateStorage } from '../state/GameStateTypes';
import { ItemId } from '../commons/CommonsTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';

export default class GameActionExecuter {
  private actionMap: Map<ItemId, GameAction> | undefined;

  public initialise(actionMap: Map<ItemId, GameAction>) {
    this.actionMap = actionMap;
  }

  public async executeStoryActions(actionIds: ItemId[] | undefined): Promise<void> {
    if (!actionIds || !actionIds.length) {
      return;
    }
    for (const actionId of actionIds) {
      if (GameActionManager.getInstance().hasTriggeredInteraction(actionId)) {
        return;
      }
      const action = this.getActionFromId(actionId);
      await this.executeStoryAction(action);
      GameActionManager.getInstance().triggerInteraction(actionId);
    }
    await GameActionManager.getInstance().saveGame();
  }

  private async executeStoryAction(action: GameAction) {
    const { actionType, actionParams, actionConditions } = action;

    if (actionConditions) {
      for (const actionCondition of actionConditions) {
        if (!this.checkCondition(actionCondition)) {
          return;
        }
      }
    }
    const actionManager = GameActionManager.getInstance();

    switch (actionType) {
      case GameActionType.LocationChange:
        // if (actionManager.getGameManager().getActivePhase() === GamePhase.Dialogue) {
        //   return;
        // }
        actionManager.changeLocationTo(actionParams.id);
        return;
      case GameActionType.Collectible:
        actionManager.obtainCollectible(actionParams.id);
        return;
      case GameActionType.UpdateChecklist:
        actionManager.completeObjective(actionParams.id);
        return;
      case GameActionType.AddItem:
        actionManager.addLocationAttr(actionParams.attr, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.RemoveItem:
        actionManager.removeLocationAttr(
          actionParams.attr,
          actionParams.locationId,
          actionParams.id
        );
        return;
      case GameActionType.AddLocationMode:
        actionManager.addLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.RemoveLocationMode:
        actionManager.addLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.BringUpDialogue:
        actionManager.getGameManager().phaseManager.pushPhase(GamePhaseType.Dialogue, actionParams);
        return;
      case GameActionType.AddPopup:
        actionManager.getGameManager().phaseManager.pushPhase(GamePhaseType.Popup, actionParams);
        return;
    }
  }

  private async checkCondition(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        return (
          GameActionManager.getInstance().existsInUserStateList(
            conditionParams.listName,
            conditionParams.id
          ) === boolean
        );
      case GameStateStorage.ChecklistState:
        return GameActionManager.getInstance().isObjectiveComplete(conditionParams.id) === boolean;
      default:
        return true;
    }
  }

  public getActionFromId(actionId: ItemId): GameAction {
    if (!this.actionMap) {
      throw new Error('Action map was not found');
    }
    const action = this.actionMap.get(actionId);

    if (!action) {
      throw new Error('Action id was not found');
    }

    return action;
  }
}
