import Parser from './Parser';
import StringUtils from '../utils/StringUtils';
import ParserConverter from './ParserConverter';
import { GameLocationAttr } from '../location/GameMapTypes';
import { GameAction, GameActionType } from '../action/GameActionTypes';
import { ItemId } from '../commons/CommonsTypes';
import ConditionParser from './ConditionParser';

export default class ActionParser {
  public static parseActions(actionDetails: string[]): ItemId[] {
    return actionDetails.map(actionDetail => this.parseAction(actionDetail));
  }

  public static parseAction(actionDetail: string): ItemId {
    const [actionString, conditionalsString] = StringUtils.splitByChar(actionDetail, 'if');

    const gameAction = this.parseActionContent(actionString);
    if (conditionalsString) {
      gameAction.actionConditions = StringUtils.splitByChar(
        conditionalsString,
        'AND'
      ).map(condition => ConditionParser.parse(condition));
    }

    Parser.checkpoint.map.addItemToMap(
      GameLocationAttr.actions,
      gameAction.interactionId,
      gameAction
    );

    return gameAction.interactionId;
  }

  public static parseActionContent(actionString: string): GameAction {
    const [action, actionParamString] = StringUtils.splitByChar(actionString, '(');
    const actionType = ParserConverter.stringToActionType(action);
    const actionParams = StringUtils.splitByChar(actionParamString.slice(0, -1), ',');
    const actionParamObj: any = {};

    switch (actionType) {
      case GameActionType.Collectible:
      case GameActionType.UpdateChecklist:
      case GameActionType.LocationChange:
      case GameActionType.ChangeBackground:
      case GameActionType.BringUpDialogue:
        actionParamObj.id = actionParams[0];
        break;
      case GameActionType.AddItem:
      case GameActionType.RemoveItem:
        actionParamObj.attr = actionParams[0];
        actionParamObj.locationId = actionParams[1];
        actionParamObj.id = actionParams[2];
        break;
      case GameActionType.AddLocationMode:
      case GameActionType.RemoveLocationMode:
        actionParamObj.locationId = actionParams[0];
        actionParamObj.mode = ParserConverter.stringToGameMode(actionParams[1]);
        break;
      case GameActionType.AddPopup:
        actionParamObj.id = actionParams[0];
        actionParamObj.position = ParserConverter.stringToPopupPosition(actionParams[1]);
        break;
    }

    const actionId = Parser.generateActionId();
    return {
      actionType,
      actionParams: actionParamObj,
      actionConditions: [],
      interactionId: actionId,
      isInteractive: false
    };
  }
}
