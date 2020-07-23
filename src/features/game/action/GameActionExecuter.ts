import { Layer } from '../layer/GameLayerTypes';
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
   * @param actionType the type of action that will be executed
   * @param actionParams an object containing all the parameters
   * @param fastForward whether or not some actions will play
   */
  public static async executeGameAction(
    actionType: GameActionType,
    actionParams: any,
    fastForward?: boolean
  ) {
    const globalAPI = GameGlobalAPI.getInstance();

    switch (actionType) {
      case GameActionType.AddItem:
        globalAPI.addItem(actionParams.gameItemType, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.RemoveItem:
        globalAPI.removeItem(actionParams.gameItemType, actionParams.locationId, actionParams.id);
        return;
      case GameActionType.AddLocationMode:
        globalAPI.addLocationMode(actionParams.locationId, actionParams.mode);
        return;
      case GameActionType.RemoveLocationMode:
        globalAPI.removeLocationMode(actionParams.locationId, actionParams.mode);
        return;
    }

    if (fastForward) return;

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
      case GameActionType.ShowDialogue:
        await globalAPI.showDialogueInSamePhase(actionParams.id);
        return;
      case GameActionType.AddPopup:
        await globalAPI.displayPopUp(actionParams.id, actionParams.position, actionParams.duration);
        return;
      case GameActionType.MakeObjectBlink:
        await globalAPI.makeObjectBlink(actionParams.id, actionParams.turnOn);
        return;
      case GameActionType.MakeObjectGlow:
        await globalAPI.makeObjectGlow(actionParams.id, actionParams.turnOn);
        return;
      case GameActionType.PlayBGM:
        SourceAcademyGame.getInstance().getSoundManager().playBgMusic(actionParams.id);
        return;
      case GameActionType.PlaySFX:
        await SourceAcademyGame.getInstance().getSoundManager().playSound(actionParams.id);
        return;
      case GameActionType.ShowObjectLayer:
        actionParams.show ? globalAPI.showLayer(Layer.Objects) : globalAPI.hideLayer(Layer.Objects);
        return;
      default:
        return;
    }
  }
}
