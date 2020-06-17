import GameUserStateManager from '../state/GameUserStateManager';
import GameStateManager from '../state/GameStateManager';
import { FullSaveState, GameSaveState, UserSaveState } from './GameSaveTypes';

export function gameStateToJson(
  prevGameState: FullSaveState,
  chapterNum: number,
  gameStateManager: GameStateManager,
  userStateManager: GameUserStateManager
): FullSaveState {
  const gameStoryState: GameSaveState = {
    chapterObjective: mapToJsObject(gameStateManager.getChapterObjectives().getObjectives()),
    locationStates: mapToJsObject(gameStateManager.getLocationStates()),
    objectPropertyMap: mapToJsObject(gameStateManager.getObjPropertyMap()),
    bboxPropertyMap: mapToJsObject(gameStateManager.getBBoxPropertyMap()),
    triggeredInteractions: mapToJsObject(gameStateManager.getTriggeredInteractions())
  };

  const userState: UserSaveState = {
    collectibles: userStateManager.getList('collectibles'),
    achievements: userStateManager.getList('achievements')
  };

  const newGameStoryStates = { ...prevGameState, [chapterNum]: gameStoryState };

  const newGameState = {
    gameSaveStates: newGameStoryStates,
    userState
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
