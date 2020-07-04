import { GameActionType, GameAction, ActionCondition } from './GameActionTypes';
import GameActionManager from './GameActionManager';
import { GameStateStorage } from '../state/GameStateTypes';
import { ItemId } from '../commons/CommonsTypes';
import GameManager from '../scenes/gameManager/GameManager';

export default class GameActionExecuter {
  private actionMap: Map<ItemId, GameAction> | undefined;

  public initialise(gameManager: GameManager) {
    this.actionMap = gameManager.currentCheckpoint.map.getActions();
  }

  public async executeStoryActions(actionIds: ItemId[] | undefined): Promise<void> {
    if (!actionIds || !actionIds.length) return;
    for (const actionId of actionIds) {
      const { actionType, actionParams, actionConditions, repeatable } = this.getActionFromId(
        actionId
      );
      if (
        repeatable ||
        (!GameActionManager.getInstance().hasTriggeredInteraction(actionId) &&
          actionConditions.every(actionCondition => this.checkCondition(actionCondition)))
      ) {
        await this.executeStoryAction(actionType, actionParams);
        GameActionManager.getInstance().triggerInteraction(actionId);
      }
    }
    await GameActionManager.getInstance().saveGame();
  }

  private async executeStoryAction(actionType: GameActionType, actionParams: any) {
    const actionManager = GameActionManager.getInstance();

    switch (actionType) {
      case GameActionType.LocationChange:
        actionManager.changeLocationTo(actionParams.id);
        return;
      case GameActionType.ChangeBackground:
        actionManager
          .getGameManager()
          .backgroundManager.renderBackgroundLayerContainer(actionParams.id);
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
        await actionManager.getGameManager().dialogueManager.playDialogue(actionParams.id);
        return;
      case GameActionType.AddPopup:
        await actionManager.displayPopUp(
          actionParams.id,
          actionParams.position,
          actionParams.duration
        );
        return;
      case GameActionType.MakeObjectBlink:
        await actionManager.makeObjectBlink(actionParams.id);
        return;
      case GameActionType.MakeObjectGlow:
        await actionManager.makeObjectGlow(actionParams.id);
        return;
    }
  }

  private checkCondition(conditional: ActionCondition) {
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
