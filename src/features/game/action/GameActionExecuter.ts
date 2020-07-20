import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { GameActionType } from './GameActionTypes';

/**
 * This class executes game actions by calling the right functions
 * from global API
 */
export default class GameActionExecuter {
  /**
   * Executes the game action based on given type and parameters
   * @actionType the type of action that will be executed
   * @actionParams an object containing all the parameters
   */
  public static async executeGameAction(actionType: GameActionType, actionParams: any) {
    const globalAPI = GameGlobalAPI.getInstance();

    switch (actionType) {
      case GameActionType.LocationChange:
        await globalAPI.changeLocationTo(actionParams.id);
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
      case GameActionType.PlayBGM:
        await SourceAcademyGame.getInstance().getSoundManager().playBgMusic(actionParams.id);
        return;
      case GameActionType.PlaySFX:
        await SourceAcademyGame.getInstance().getSoundManager().playSound(actionParams.id);
        return;
      default:
        return;
    }
  }
}
