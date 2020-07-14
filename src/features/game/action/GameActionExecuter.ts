import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { GameActionType } from './GameActionTypes';

export default class GameActionExecuter {
  public static async executeGameAction(actionType: GameActionType, actionParams: any) {
    const globalAPI = GameGlobalAPI.getInstance();

    switch (actionType) {
      case GameActionType.LocationChange:
        globalAPI.changeLocationTo(actionParams.id);
        return;
      case GameActionType.ChangeBackground:
        globalAPI.renderBackgroundLayerContainer(actionParams.id);
        return;
      case GameActionType.ObtainCollectible:
        globalAPI.obtainCollectible(actionParams.id);
        return;
      case GameActionType.CompleteObjective:
        globalAPI.completeObjective(actionParams.id);
        return;
      case GameActionType.AddItem:
        globalAPI.addLocationAttr(actionParams.attr, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.RemoveItem:
        globalAPI.removeLocationAttr(actionParams.attr, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.AddLocationMode:
        globalAPI.addLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.RemoveLocationMode:
        globalAPI.removeLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.BringUpDialogue:
        await globalAPI.showDialogueInSamePhase(actionParams.id);
        return;
      case GameActionType.AddPopup:
        await globalAPI.displayPopUp(actionParams.id, actionParams.position, actionParams.duration);
        return;
      case GameActionType.MakeObjectBlink:
        await globalAPI.makeObjectBlink(actionParams.id);
        return;
      case GameActionType.MakeObjectGlow:
        await globalAPI.makeObjectGlow(actionParams.id);
        return;
      default:
        return;
    }
  }
}
