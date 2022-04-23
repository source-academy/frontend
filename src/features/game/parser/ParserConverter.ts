import { GameActionType } from '../action/GameActionTypes';
import { GamePosition, GameSize } from '../commons/CommonTypes';
import { GameItemType } from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameStateStorage, UserStateType } from '../state/GameStateTypes';
import { mandatory } from '../utils/GameUtils';

const stringToSizeMap = {
  small: GameSize.Small,
  medium: GameSize.Medium,
  large: GameSize.Large
};

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
  complete_task: GameActionType.CompleteTask,
  show_task: GameActionType.ShowTask,
  add_item: GameActionType.AddItem,
  remove_item: GameActionType.RemoveItem,
  change_background: GameActionType.ChangeBackground,
  start_animation: GameActionType.StartAnimation,
  stop_animation: GameActionType.StopAnimation,
  show_dialogue: GameActionType.ShowDialogue,
  add_mode: GameActionType.AddLocationMode,
  remove_mode: GameActionType.RemoveLocationMode,
  add_popup: GameActionType.AddPopup,
  make_object_glow: GameActionType.MakeObjectGlow,
  make_object_blink: GameActionType.MakeObjectBlink,
  play_bgm: GameActionType.PlayBGM,
  play_sfx: GameActionType.PlaySFX,
  preview_location: GameActionType.PreviewLocation,
  show_object_layer: GameActionType.ShowObjectLayer,
  navigate_to_assessment: GameActionType.NavigateToAssessment,
  update_assessment_status: GameActionType.UpdateAssessmentStatus,
  delay: GameActionType.Delay
};

const stringToGameStateStorageMap = {
  checklist: GameStateStorage.ChecklistState,
  tasklist: GameStateStorage.TasklistState,
  userstate: GameStateStorage.UserState
};

const stringToUserStateTypeMap = {
  assessments: UserStateType.assessments,
  achievements: UserStateType.achievements,
  collectibles: UserStateType.collectibles
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
  public static stringToSize(str: string) {
    return stringToSizeMap[str] || GameSize.Medium;
  }

  public static stringToPosition(str: string) {
    return stringToPositionMap[str] || GamePosition.Middle;
  }

  public static stringToGameMode(str: string) {
    return mandatory(stringToGameModeMap[str], `Invalid location mode, ${str}`);
  }

  public static stringToActionType(str: string) {
    return mandatory(stringToActionTypeMap[str], `Invalid action type, ${str}`);
  }

  public static stringToGameStateStorage(str: string) {
    return mandatory(stringToGameStateStorageMap[str], `Invalid condition type, ${str}`);
  }

  public static stringToGameItemType(str: string) {
    return mandatory(stringToGameItemMap[str], `Invalid entity type, ${str}`);
  }

  public static stringToBoolean(str: string) {
    return str === 'false' ? false : true;
  }

  public static stringToUserStateType(str: string) {
    return mandatory(stringToUserStateTypeMap[str], `Invalid user state type ${str}`);
  }
}
