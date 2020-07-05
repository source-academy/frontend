import { GameActionType, GameAction, ActionCondition } from './GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import { ItemId } from '../commons/CommonsTypes';
import GameManager from '../scenes/gameManager/GameManager';

export default class GameActionExecuter {
  private actionMap: Map<ItemId, GameAction> | undefined;
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.actionMap = gameManager.currentCheckpoint.map.getActions();
    this.gameManager = gameManager;
  }

  public async executeStoryActions(actionIds: ItemId[] | undefined): Promise<void> {
    if (!actionIds || !actionIds.length) return;
    for (const actionId of actionIds) {
      const { actionType, actionParams, actionConditions, repeatable } = this.getActionFromId(
        actionId
      );
      if (
        (repeatable || !this.gameManager.getStateManager().hasTriggeredInteraction(actionId)) &&
        actionConditions.every(actionCondition => this.checkCondition(actionCondition))
      ) {
        await this.executeStoryAction(actionType, actionParams);
        this.gameManager.getStateManager().triggerInteraction(actionId);
      }
    }
    await this.gameManager.getSaveManager().saveGame(this.gameManager);
  }

  private async executeStoryAction(actionType: GameActionType, actionParams: any) {
    switch (actionType) {
      case GameActionType.LocationChange:
        this.gameManager.changeLocationTo(actionParams.id);
        return;
      case GameActionType.ChangeBackground:
        this.gameManager.getBackgroundManager().renderBackgroundLayerContainer(actionParams.id);
        return;
      case GameActionType.Collectible:
        this.gameManager.getUserStateManager().addToList('collectibles', actionParams.id);
        return;
      case GameActionType.UpdateChecklist:
        this.gameManager.getStateManager().completeObjective(actionParams.id);
        return;
      case GameActionType.AddItem:
        this.gameManager
          .getStateManager()
          .addLocationAttr(actionParams.attr, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.RemoveItem:
        this.gameManager
          .getStateManager()
          .removeLocationAttr(actionParams.attr, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.AddLocationMode:
        this.gameManager
          .getStateManager()
          .addLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.RemoveLocationMode:
        this.gameManager
          .getStateManager()
          .removeLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.BringUpDialogue:
        await this.gameManager.getDialogueManager().playDialogue(actionParams.id);
        return;
      case GameActionType.AddPopup:
        await this.gameManager
          .getPopupManager()
          .displayPopUp(actionParams.id, actionParams.position, actionParams.duration);
        return;
      case GameActionType.MakeObjectBlink:
        await this.gameManager.getObjectManager().makeObjectBlink(actionParams.id);
        return;
      case GameActionType.MakeObjectGlow:
        await this.gameManager.getObjectManager().makeObjectGlow(actionParams.id);
        return;
    }
  }

  private checkCondition(conditional: ActionCondition) {
    const { state, conditionParams, boolean } = conditional;
    switch (state) {
      case GameStateStorage.UserState:
        return (
          this.gameManager
            .getUserStateManager()
            .doesIdExistInList(conditionParams.listName, conditionParams.id) === boolean
        );
      case GameStateStorage.ChecklistState:
        return (
          this.gameManager.getStateManager().isObjectiveComplete(conditionParams.id) === boolean
        );
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
