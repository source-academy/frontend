import { GameMode } from '../mode/GameModeTypes';
import { GameActionType } from '../action/GameActionTypes';
import { GameStateStorage } from '../state/GameStateTypes';
import { GameLocationAttr } from '../location/GameMapTypes';
import { GamePosition } from '../commons/CommonTypes';

const stringToPositionMap = {
  left: GamePosition.Left,
  middle: GamePosition.Middle,
  right: GamePosition.Right
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
  obtain_collectible: GameActionType.ObtainCollectible,
  complete_objective: GameActionType.CompleteObjective,
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
  public static stringToPosition(str: string) {
    return stringToPositionMap[str] || GamePosition.Middle;
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
      throw new Error(`Invalid condition type, ${str}`);
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
