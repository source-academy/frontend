import { Layer } from '../layer/GameLayerTypes';
import { GamePhaseType } from '../phase/GamePhaseTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { sleep } from '../utils/GameUtils';
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
   */
  public static async executeGameAction(actionType: GameActionType, actionParams: any) {
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
      case GameActionType.MoveCharacter:
        globalAPI.moveCharacter(actionParams.id, actionParams.locationId, actionParams.position);
        return;
      case GameActionType.UpdateCharacter:
        globalAPI.updateCharacter(actionParams.id, actionParams.expression);
        return;
      case GameActionType.ChangeBackground:
        globalAPI.renderBackgroundLayerContainer(actionParams.id);
        return;
      case GameActionType.StartAnimation:
        globalAPI.startAnimation(actionParams.id, actionParams.startFrame, actionParams.frameRate);
        return;
      case GameActionType.StopAnimation:
        globalAPI.stopAnimation(actionParams.id);
        return;
      case GameActionType.PreviewLocation:
        globalAPI.renderBackgroundLayerContainer(actionParams.id);
        globalAPI.renderObjectLayerContainer(actionParams.id);
        globalAPI.renderBBoxLayerContainer(actionParams.id);
        return;
      case GameActionType.ObtainCollectible:
        globalAPI.obtainCollectible(actionParams.id);
        return;
      case GameActionType.CompleteObjective:
        globalAPI.completeObjective(actionParams.id);
        return;
      case GameActionType.CompleteTask:
        globalAPI.completeTask(actionParams.id);
        return;
      case GameActionType.ShowTask:
        globalAPI.showTask(actionParams.id);
        return;
      case GameActionType.ShowDialogue:
        if (globalAPI.isCurrentPhase(GamePhaseType.Sequence)) {
          await globalAPI.showDialogueInSamePhase(actionParams.id);
        } else {
          await globalAPI.showDialogue(actionParams.id);
        }
        return;
      case GameActionType.AddPopup:
        await globalAPI.displayPopUp(
          actionParams.id,
          actionParams.position,
          actionParams.duration,
          actionParams.size
        );
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
        if (actionParams.show) {
          globalAPI.showLayer(Layer.Objects);
        } else {
          globalAPI.hideLayer(Layer.Objects);
        }
        return;
      case GameActionType.NavigateToAssessment:
        await globalAPI.promptNavigateToAssessment(actionParams.assessmentId);
        return;
      case GameActionType.UpdateAssessmentStatus:
        await globalAPI.updateAssessmentState();
        return;
      case GameActionType.Delay:
        await sleep(actionParams.duration);
        return;
      case GameActionType.ShowQuiz:
        globalAPI.enableKeyboardInput(false);
        await globalAPI.showQuiz(actionParams.id);
        globalAPI.enableKeyboardInput(true);
        return;
      default:
        return;
    }
  }

  /**
   * Determines if action is state change action type
   * State-change actions are replayed at the start of every game
   * They are actions that modify that game map's original state
   *
   * @param actionType - the type of action
   */
  public static isStateChangeAction(actionType: GameActionType) {
    switch (actionType) {
      case GameActionType.AddItem:
      case GameActionType.RemoveItem:
      case GameActionType.AddLocationMode:
      case GameActionType.RemoveLocationMode:
      case GameActionType.MoveCharacter:
      case GameActionType.UpdateCharacter:
        return true;
      case GameActionType.NavigateToAssessment:
      case GameActionType.UpdateAssessmentStatus:
      case GameActionType.PreviewLocation:
      case GameActionType.ChangeBackground:
      case GameActionType.StartAnimation:
      case GameActionType.StopAnimation:
      case GameActionType.ObtainCollectible:
      case GameActionType.CompleteObjective:
      case GameActionType.CompleteTask:
      case GameActionType.ShowTask:
      case GameActionType.ShowDialogue:
      case GameActionType.AddPopup:
      case GameActionType.MakeObjectBlink:
      case GameActionType.MakeObjectGlow:
      case GameActionType.PlayBGM:
      case GameActionType.PlaySFX:
      case GameActionType.ShowObjectLayer:
      case GameActionType.Delay:
      case GameActionType.ShowQuiz:
        return false;
    }
  }
}
