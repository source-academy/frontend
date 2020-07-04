import { CharacterPosition } from '../character/GameCharacterTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameActionType } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';

const stringToPositionMap = {
  left: CharacterPosition.Left,
  middle: CharacterPosition.Middle,
  right: CharacterPosition.Right
};

const stringToGameModeMap = {
  talk: GameMode.Talk,
  explore: GameMode.Explore,
  move: GameMode.Move,
  menu: GameMode.Menu
};

const stringToActionTypeMap = {
  move_character: GameActionType.MoveCharacter,
  update_character: GameActionType.UpdateCharacter,
  collectible: GameActionType.Collectible,
  update_checklist: GameActionType.UpdateChecklist,
  change_location: GameActionType.LocationChange,
  add_item: GameActionType.AddItem,
  remove_item: GameActionType.RemoveItem,
  change_background: GameActionType.ChangeBackground,
  show_dialogue: GameActionType.BringUpDialogue,
  add_mode: GameActionType.AddLocationMode,
  remove_mode: GameActionType.RemoveLocationMode,
  add_popup: GameActionType.AddPopup
};

const stringToGameStateStorageMap = {
  checklist: GameStateStorage.ChecklistState,
  userstate: GameStateStorage.UserState
};

export default class ParserConverter {
  public static stringToPosition(str: string) {
    return stringToPositionMap[str];
  }

  public static stringToGameMode(str: string) {
    const result = stringToGameModeMap[str];
    if (!result) {
      throw new Error(`Invalid location mode, ${str}`);
    }
    return result;
  }

  public static stringToActionType(str: string) {
    const result = stringToActionTypeMap[str];
    if (!result) {
      throw new Error(`Invalid action type, ${str}`);
    }
    return result;
  }

  public static stringToGameStateStorage(str: string) {
    const result = stringToGameStateStorageMap[str];
    if (!result) {
      throw new Error(`Invalid action type, ${str}`);
    }
    return result;
  }
}
