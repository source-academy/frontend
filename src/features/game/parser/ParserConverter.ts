import { GameActionType } from '../action/GameActionTypes';
import { GamePosition } from '../commons/CommonTypes';
import { GameLocationAttr } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameStateStorage, UserStateTypes } from '../state/GameStateTypes';

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
  make_object_blink: GameActionType.MakeObjectBlink,
  play_bgm: GameActionType.PlayBGM,
  play_sfx: GameActionType.PlaySFX
};

const stringToGameStateStorageMap = {
  checklist: GameStateStorage.ChecklistState,
  userstate: GameStateStorage.UserState
};

const stringToUserStateMap = {
  achievements: UserStateTypes.achievements,
  collectibles: UserStateTypes.collectibles
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

  public static stringToLocAttr(str: string) {
    const result = stringToLocAttrMap[str];
    if (!result) {
      throw new Error(`Invalid entity type, ${str}`);
    }
    return result;
  }

  public static stringToUserState(str: string) {
    const result = stringToUserStateMap[str];
    if (!result) {
      throw new Error(`Invalid user state type, ${str}`);
    }
    return result;
  }
}
