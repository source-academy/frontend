import {
  GameAction,
  createCondition,
  ActionCondition,
  GameActionType
} from '../action/GameActionTypes';
import { splitByChar, stripEnclosingChars, isEnclosedBySquareBrackets } from './ParserHelper';
import { GameStateStorage } from '../state/GameStateTypes';
import { textToGameModeMap } from './LocationParser';
import { ItemId } from '../commons/CommonsTypes';
import Parser from './Parser';
import { GameLocationAttr } from '../location/GameMapTypes';

export default function ActionParser(actionText: string[]): ItemId[] {
  return actionText.map(parseAction);
}

// converts full action string (with conditions) to action object
function parseAction(fullActionString: string): ItemId {
  const [actionString, conditionalsString] = splitByChar(fullActionString, 'if');

  const gameAction = strToAction(actionString);
  if (conditionalsString) {
    gameAction.actionConditions = splitByChar(conditionalsString, 'AND').map(strToCondition);
  }

  Parser.chapter.map.addItemToMap(GameLocationAttr.actions, gameAction.interactionId, gameAction);

  return gameAction.interactionId;
}

/*
 * Converts actionstring to action object (without conditions)
 */
function strToAction(actionString: string): GameAction {
  const [action, actionParamString] = splitByChar(actionString, ':');
  const actionType = stringToActionType[action];

  let actionParams;
  if (isEnclosedBySquareBrackets(actionParamString)) {
    actionParams = splitByChar(stripEnclosingChars(actionParamString), ' ');
  } else {
    actionParams = [actionParamString];
  }
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
      actionParamObj.mode = textToGameModeMap[actionParams[1]];
      break;
  }

  const actionId = Parser.generateActionId();
  return {
    actionType,
    actionParams: actionParamObj,
    interactionId: actionId,
    isInteractive: false
  };
}

export const stringToActionType = {
  moveCharacter: GameActionType.MoveCharacter,
  updateCharacter: GameActionType.UpdateCharacter,
  collectible: GameActionType.Collectible,
  updateChecklist: GameActionType.UpdateChecklist,
  locationChange: GameActionType.LocationChange,
  addItem: GameActionType.AddItem,
  removeItem: GameActionType.RemoveItem,
  changeBackground: GameActionType.ChangeBackground,
  bringUpDialogue: GameActionType.BringUpDialogue,
  addLocationMode: GameActionType.AddLocationMode,
  removeLocationMode: GameActionType.RemoveLocationMode
};

/*
 * Converts conditional string e.g. 'checklist.wallet' to condition object {
 * { state: GameStateStorage.UserState, conditionParams: {listName..., id...} }
 */
function strToCondition(conditionString: string): ActionCondition {
  const [gameStateStorage, condParams] = splitByChar(conditionString, '.');

  switch (strToGameStateStorage[gameStateStorage]) {
    case GameStateStorage.ChecklistState:
      return createCondition(GameStateStorage.ChecklistState, { id: condParams[0] });
    case GameStateStorage.UserState:
      return createCondition(GameStateStorage.UserState, {
        listName: condParams[0],
        id: condParams[1]
      });
    default:
      throw new Error('Parsing error: Cannot find storage for action if condition');
  }
}

const strToGameStateStorage = {
  checklist: GameStateStorage.ChecklistState,
  userstate: GameStateStorage.UserState
};
