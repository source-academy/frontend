import Parser from './Parser';
import StringUtils from '../utils/StringUtils';
import ParserConverter from './ParserConverter';
import { GameLocationAttr } from '../location/GameMapTypes';
import { GameAction, GameActionType } from '../action/GameActionTypes';
import { ItemId } from '../commons/CommonsTypes';
import ConditionParser from './ConditionParser';
import { GameAttr } from './ParserValidator';

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
    let repeatable = false;
    let actionType = action;
    if (action[action.length - 1] === '*') {
      repeatable = true;
      actionType = actionType.slice(0, -1);
    }

    const gameActionType = ParserConverter.stringToActionType(actionType);
    const actionParams = StringUtils.splitByChar(actionParamString.slice(0, -1), ',');
    const actionParamObj: any = {};

    switch (gameActionType) {
      case GameActionType.Collectible:
        actionParamObj.id = Parser.validator.assertLocAttr(
          GameLocationAttr.collectibles,
          actionParams[0],
          actionType
        );
        break;
      case GameActionType.UpdateChecklist:
        actionParamObj.id = Parser.validator.assertAttr(
          GameAttr.objectives,
          actionParams[0],
          actionType
        );
        break;
      case GameActionType.LocationChange:
      case GameActionType.ChangeBackground:
        actionParamObj.id = Parser.validator.assertAttr(
          GameAttr.locations,
          actionParams[0],
          actionType
        );
        break;
      case GameActionType.BringUpDialogue:
        actionParamObj.id = Parser.validator.assertLocAttr(
          GameLocationAttr.talkTopics,
          actionParams[0],
          actionType
        );
        break;
      case GameActionType.AddItem:
      case GameActionType.RemoveItem:
        const gameLocAttr = ParserConverter.stringToLocAttr(actionParams[0]);
        actionParamObj.attr = gameLocAttr;
        actionParamObj.locationId = Parser.validator.assertAttr(
          GameAttr.locations,
          actionParams[1],
          actionType
        );
        actionParamObj.id = Parser.validator.assertLocAttr(
          gameLocAttr,
          actionParams[2],
          actionType
        );
        break;
      case GameActionType.AddLocationMode:
      case GameActionType.RemoveLocationMode:
        actionParamObj.locationId = Parser.validator.assertAttr(
          GameAttr.locations,
          actionParams[0],
          actionType
        );
        actionParamObj.mode = ParserConverter.stringToGameMode(actionParams[1]);
        break;
      case GameActionType.AddPopup:
        actionParamObj.id = Parser.validator.assertLocAttr(
          GameLocationAttr.objects,
          actionParams[0],
          actionType
        );
        actionParamObj.position = ParserConverter.stringToPopupPosition(actionParams[1]);
        break;
      case GameActionType.MakeObjectBlink:
        actionParamObj.id = Parser.validator.assertLocAttr(
          GameLocationAttr.objects,
          actionParams[0],
          actionType
        );
        break;
      case GameActionType.MakeObjectGlow:
        actionParamObj.id = Parser.validator.assertLocAttr(
          GameLocationAttr.objects,
          actionParams[0],
          actionType
        );
        break;
    }

    const actionId = Parser.generateActionId();
    return {
      actionType: gameActionType,
      actionParams: actionParamObj,
      actionConditions: [],
      interactionId: actionId,
      isInteractive: false,
      repeatable
    };
  }
}
