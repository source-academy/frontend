import { GameActionType, GameAction, ActionCondition } from './GameActionTypes';
import GameActionManager from './GameActionManager';
import { GameStateStorage } from '../state/GameStateTypes';
import { GamePhase } from '../mode/GameModeTypes';

export default class GameActionExecuter {
  public async executeStoryActions(actions: GameAction[]) {
    for (const action of actions) {
      await this.executeStoryAction(action);
    }
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
        if (actionManager.getGameManager().getActivePhase() === GamePhase.Dialogue) {
          return;
        }
        actionManager.changeLocationTo(actionParams.id);
        return;
      case GameActionType.Collectible:
        actionManager.obtainCollectible(actionParams.id);
        return;
      case GameActionType.UpdateChecklist:
        actionManager.completeObjective(actionParams.id);
        return;
      case GameActionType.AddItem:
        actionManager.addLocationAttr(
          actionParams.id,
          actionParams.locationId,
          actionParams.attrName
        );
        return;
      case GameActionType.RemoveItem:
        actionManager.addLocationAttr(
          actionParams.id,
          actionParams.locationId,
          actionParams.attrName
        );
        return;
      case GameActionType.BringUpDialogue:
        if (actionManager.getGameManager().getActivePhase() === GamePhase.Dialogue) {
          return;
        }
        actionManager.bringUpDialogue(actionParams.id);
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
    }
    return true;
  }
}
