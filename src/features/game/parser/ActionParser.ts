import {
  GameAction,
  createGameAction,
  createCondition,
  ActionCondition,
  GameActionType
} from '../action/GameActionTypes';
import { splitByChar, stripEnclosingChars, isEnclosedBySquareBrackets } from './ParserHelper';
import { GameStateStorage } from '../state/GameStateTypes';

export default function ActionParser(actionText: string): GameAction[] {
  return actionText.split(',').map(parseAction);
}

// converts full action string (with conditions) to action object
function parseAction(fullActionString: string): GameAction {
  const [actionString, conditionalsString] = splitByChar(fullActionString, 'if');

  const actionObj = strToAction(actionString);
  if (conditionalsString) {
    actionObj.actionConditions = splitByChar(conditionalsString, 'AND').map(strToCondition);
  }

  return actionObj;
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
  }

  return createGameAction(actionType, actionParamObj);
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
  bringUpDialogue: GameActionType.BringUpDialogue
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
