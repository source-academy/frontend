import { CharacterPosition } from '../character/GameCharacterTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameActionType } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import { PopUpPosition } from '../popUp/GamePopUpTypes';
import { GameLocationAttr } from '../location/GameMapTypes';

const stringToCharPositionMap = {
  left: CharacterPosition.Left,
  middle: CharacterPosition.Middle,
  right: CharacterPosition.Right
};

const stringToPopupPositionMap = {
  left: PopUpPosition.Left,
  middle: PopUpPosition.Middle,
  right: PopUpPosition.Right
};

const stringToGameModeMap = {
  talk: GameMode.Talk,
  explore: GameMode.Explore,
  move: GameMode.Move,
  menu: GameMode.Menu
};

const stringToLocAttrMap = {
  navigation: GameLocationAttr.navigation,
  talkTopics: GameLocationAttr.talkTopics,
  objects: GameLocationAttr.objects,
  boundingBoxes: GameLocationAttr.boundingBoxes,
  characters: GameLocationAttr.characters,
  actions: GameLocationAttr.actions,
  bgmKey: GameLocationAttr.bgmKey,
  collectibles: GameLocationAttr.collectibles
};

const stringToActionTypeMap = {
  move_character: GameActionType.MoveCharacter,
  update_character: GameActionType.UpdateCharacter,
  collectible: GameActionType.Collectible,
  complete_objective: GameActionType.UpdateChecklist,
  change_location: GameActionType.LocationChange,
  add_item: GameActionType.AddItem,
  remove_item: GameActionType.RemoveItem,
  change_background: GameActionType.ChangeBackground,
  show_dialogue: GameActionType.BringUpDialogue,
  add_mode: GameActionType.AddLocationMode,
  remove_mode: GameActionType.RemoveLocationMode,
  add_popup: GameActionType.AddPopup,
  make_object_glow: GameActionType.MakeObjectGlow,
  make_object_blink: GameActionType.MakeObjectBlink
};

const stringToGameStateStorageMap = {
  checklist: GameStateStorage.ChecklistState,
  userstate: GameStateStorage.UserState
};

export default class ParserConverter {
  public static stringToCharPosition(str: string) {
    return stringToCharPositionMap[str] || CharacterPosition.Middle;
  }

  public static stringToPopupPosition(str: string) {
    return stringToPopupPositionMap[str] || PopUpPosition.Middle;
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

  public static stringToLocAttr(str: string) {
    const result = stringToLocAttrMap[str];
    if (!result) {
      throw new Error(`Invalid entity type, ${str}`);
    }
    return result;
  }
}
