import { GameAction, GameActionType } from '../action/GameActionTypes';
import { ItemId } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import StringUtils from '../utils/StringUtils';
import ConditionParser from './ConditionParser';
import Parser from './Parser';
import ParserConverter from './ParserConverter';
import { GameEntityType } from './ParserValidator';

/**
 * The Action Parser parses actions for all entities.
 * This class takes in action strings to produce GameAction objects,
 * which store information about action type and
 * action params (much like React actions)
 */
export default class ActionParser {
  /**
   * Parses many action strings, stores resulting Game Action objects
   * inside the game map, and returns the corresponding actionIds.
   *
   * @param fullActionStrings raw action strings, eg ["show_dialogue(done)", "change_location(room) if gamestate.finish"]
   * @returns {Array<ItemId>} returns actionIds of the parsed actions with actions are stored in the game map.
   */
  public static parseActions(fullActionStrings: string[]): ItemId[] {
    return fullActionStrings.map(fullActionString => this.parseAction(fullActionString));
  }

  /**
   * Parses an action string, stores resulting Game Action object
   * inside the game map, and returns the corresponding actionId.
   *
   * @param rawActionString raw action string eg "show_dialogue(done) if gamestate.finish"
   * @returns {ItemId} returns actionId of the parsed actions, as action is stored in the game map.
   */
  public static parseAction(rawActionString: string): ItemId {
    const [actionString, conditionalsString] = StringUtils.splitByChar(rawActionString, 'if');

    const gameAction = this.parseActionContent(actionString);
    if (conditionalsString) {
      gameAction.actionConditions = StringUtils.splitByChar(conditionalsString, 'AND').map(
        condition => ConditionParser.parse(condition)
      );
    }

    Parser.checkpoint.map.setItemInMap(GameItemType.actions, gameAction.interactionId, gameAction);

    return gameAction.interactionId;
  }

  /**
   * This funciton converts action strings eg "show_dialogue(hello)"
   * (excluding conditionals) into Game Action objects
   *
   * Note that this function also validates the parameters to make
   * sure that they are used correctly.
   *
   * @param actionString the action string to be parsed
   * @returns {GameAction} resulting action that can be stored in the game map
   */
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
      case GameActionType.ObtainCollectible:
        actionParamObj.id = actionParams[0];
        break;

      case GameActionType.CompleteObjective:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.objectives, actionParams[0], actionType);
        break;

      case GameActionType.CompleteTask:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.tasks, actionParams[0], actionType);
        break;

      case GameActionType.ShowTask:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.tasks, actionParams[0], actionType);
        break;

      case GameActionType.PreviewLocation:
      case GameActionType.ChangeBackground:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.locations, actionParams[0], actionType);
        break;
      case GameActionType.StartAnimation:
        actionParamObj.id = actionParams[0];
        actionParamObj.startFrame = +actionParams[1];
        actionParamObj.frameRate = +actionParams[2];
        actionParamObj.assetCategory = actionParams[3];
        Parser.validator.assertAnimType(actionParams[0], actionType);
        break;
      case GameActionType.StopAnimation:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertAnimType(actionParams[0], actionType);
        break;
      case GameActionType.ShowDialogue:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertItemType(GameItemType.dialogues, actionParams[0], actionType);
        break;

      case GameActionType.AddItem:
      case GameActionType.RemoveItem:
        const gameItemType = ParserConverter.stringToGameItemType(actionParams[0]);
        actionParamObj.gameItemType = gameItemType;

        actionParamObj.locationId = actionParams[1];
        Parser.validator.assertEntityType(GameEntityType.locations, actionParams[1], actionType);

        actionParamObj.id = actionParams[2];
        Parser.validator.assertItemType(gameItemType, actionParams[2], actionType);
        break;

      case GameActionType.AddLocationMode:
      case GameActionType.RemoveLocationMode:
        Parser.validator.assertEntityType(GameEntityType.locations, actionParams[0], actionType);
        actionParamObj.locationId = actionParams[0];
        actionParamObj.mode = ParserConverter.stringToGameMode(actionParams[1]);
        break;

      case GameActionType.AddPopup:
        Parser.validator.assertItemType(GameItemType.objects, actionParams[0], actionType);
        actionParamObj.id = actionParams[0];
        actionParamObj.position = ParserConverter.stringToPosition(actionParams[1]);
        if (actionParams[2]) {
          actionParamObj.duration = parseInt(actionParams[2]) * 1000;
        }
        if (actionParams[3]) {
          actionParamObj.size = ParserConverter.stringToSize(actionParams[3]);
        }
        break;

      case GameActionType.MakeObjectBlink:
        Parser.validator.assertItemType(GameItemType.objects, actionParams[0], actionType);
        actionParamObj.id = actionParams[0];
        actionParamObj.turnOn = ParserConverter.stringToBoolean(actionParams[1]);
        break;

      case GameActionType.MakeObjectGlow:
        Parser.validator.assertItemType(GameItemType.objects, actionParams[0], actionType);
        actionParamObj.id = actionParams[0];
        actionParamObj.turnOn = ParserConverter.stringToBoolean(actionParams[1]);
        break;

      case GameActionType.PlayBGM:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.bgms, actionParams[0], actionType);
        break;

      case GameActionType.PlaySFX:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertEntityType(GameEntityType.sfxs, actionParams[0], actionType);
        break;

      case GameActionType.ShowObjectLayer:
        actionParamObj.show = ParserConverter.stringToBoolean(actionParams[0]);
        break;

      case GameActionType.UpdateCharacter:
        Parser.validator.assertItemType(GameItemType.characters, actionParams[0], actionType);
        actionParamObj.id = actionParams[0];
        actionParamObj.expression = actionParams[1];
        break;

      case GameActionType.MoveCharacter:
        Parser.validator.assertItemType(GameItemType.characters, actionParams[0], actionType);
        Parser.validator.assertEntityType(GameEntityType.locations, actionParams[1], actionType);
        actionParamObj.id = actionParams[0];
        actionParamObj.locationId = actionParams[1];
        actionParamObj.position = ParserConverter.stringToPosition(actionParams[2]);
        break;

      case GameActionType.NavigateToAssessment:
        actionParamObj.assessmentId = actionParams[0];
        break;

      case GameActionType.Delay:
        actionParamObj.duration = parseInt(actionParams[0]) * 1000;
        break;

      case GameActionType.ShowQuiz:
        actionParamObj.id = actionParams[0];
        Parser.validator.assertItemType(GameItemType.quizzes, actionParams[0], actionType);
        break;
    }

    const actionId = Parser.generateActionId();
    return {
      actionType: gameActionType,
      actionParams: actionParamObj,
      actionConditions: [],
      interactionId: actionId,
      isInteractive: false,
      isRepeatable: repeatable
    };
  }
}
