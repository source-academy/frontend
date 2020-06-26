import { FullSaveState, GameSaveState, UserSaveState, SettingsJson } from './GameSaveTypes';
import GameActionManager from '../action/GameActionManager';

export function gameStateToJson(
  prevGameState: FullSaveState,
  chapterNum: number,
  checkpointNum: number,
  completedChapter?: boolean
): FullSaveState {
  const gameManager = GameActionManager.getInstance().getGameManager();
  const gameStateManager = gameManager.stateManager;
  const userStateManager = gameManager.userStateManager;
  const phaseManager = gameManager.phaseManager;

  const gameStoryState: GameSaveState = {
    currentLocation: gameManager.currentLocationId,
    currentPhase: phaseManager.getCurrentPhase(),
    chapterObjective: mapToJsObject(gameStateManager.getCheckpointObjectives().getObjectives()),
    locationStates: mapToJsObject(gameStateManager.getLocationStates()),
    objectPropertyMap: mapToJsObject(gameStateManager.getObjPropertyMap()),
    bboxPropertyMap: mapToJsObject(gameStateManager.getBBoxPropertyMap()),
    triggeredInteractions: mapToJsObject(gameStateManager.getTriggeredInteractions()),
    lastCheckpointPlayed: checkpointNum,
    isComplete: prevGameState.gameSaveStates[chapterNum].isComplete
  };

  const userState: UserSaveState = {
    settings: { ...prevGameState.userState.settings },
    lastPlayedCheckpoint: [chapterNum, checkpointNum],
    collectibles: userStateManager.getList('collectibles'),
    achievements: userStateManager.getList('achievements'),
    lastCompletedChapter: prevGameState.userState.lastCompletedChapter
  };

  if (completedChapter) {
    gameStoryState.isComplete = true;
    userState.lastCompletedChapter = Math.max(userState.lastCompletedChapter, chapterNum);
  }

  const newGameStoryStates = { ...prevGameState.gameSaveStates, [chapterNum]: gameStoryState };

  const newGameState = {
    gameSaveStates: newGameStoryStates,
    userState
  };

  return newGameState;
}

export function userSettingsToJson(
  prevGameState: FullSaveState,
  settingsJson: SettingsJson
): FullSaveState {
  const newGameState = {
    gameSaveStates: prevGameState.gameSaveStates,
    userState: { ...prevGameState.userState, settings: settingsJson }
  };

  return newGameState;
}

function mapToJsObject<K, V>(map: Map<K, V>): any {
  const jsObject = {};
  map.forEach((value: V, key: K) => {
    jsObject[(key as any) as string] = value;
  });
  return jsObject;
}

export function jsObjectToMap(obj: any): Map<string, any> {
  const map = new Map<string, any>();

  if (Object.keys(obj).length) {
    Object.keys(obj).forEach((key: string) => {
      map.set(key, obj[key]);
    });
  }

  return map;
}
