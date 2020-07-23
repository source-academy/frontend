import { GameActionType } from '../action/GameActionTypes';
import { GamePosition } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameStateStorage } from '../state/GameStateTypes';

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

const stringToGameItemMap = {
  navigation: GameItemType.navigation,
  talkTopics: GameItemType.talkTopics,
  objects: GameItemType.objects,
  boundingBoxes: GameItemType.boundingBoxes,
  characters: GameItemType.characters,
  actions: GameItemType.actions,
  bgmKey: GameItemType.bgmKey,
  collectibles: GameItemType.collectibles
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
  show_dialogue: GameActionType.ShowDialogue,
  add_mode: GameActionType.AddLocationMode,
  remove_mode: GameActionType.RemoveLocationMode,
  add_popup: GameActionType.AddPopup,
  make_object_glow: GameActionType.MakeObjectGlow,
  make_object_blink: GameActionType.MakeObjectBlink,
  play_bgm: GameActionType.PlayBGM,
  play_sfx: GameActionType.PlaySFX,
  show_object_layer: GameActionType.ShowObjectLayer
};

const stringToGameStateStorageMap = {
  checklist: GameStateStorage.ChecklistState,
  userstate: GameStateStorage.UserState
};

/**
 * This class is in charge of converting strings from
 * the txt into enums that can be stored in the Checkpoint
 * object, which can be read and played by the game engine.
 *
 * This also acts as a validity checker to ensure that
 * strings such as action types (eg 'show_dialogue') and
 * game modes (eg 'explore') are actually valid enums
 */
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

  public static stringToGameItemType(str: string) {
    const result = stringToGameItemMap[str];
    if (!result) {
      throw new Error(`Invalid entity type, ${str}`);
    }
    return result;
  }

  public static stringToBoolean(str: string) {
    return str === 'false' ? false : true;
  }
}
