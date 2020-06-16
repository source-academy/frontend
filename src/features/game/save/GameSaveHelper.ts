import GameUserStateManager from '../state/GameUserStateManager';
import GameStateManager from '../state/GameStateManager';

export type FullGameState = {
  gameStoryStates: { [chapterNum: number]: GameStoryState };
  userState: UserState;
};

export type GameStoryState = {
  chapterObjective: { [objective: string]: boolean };
  locationStates: {
    [locationId: string]: {
      id: string;
      name: string;
      assetKey: string;
      modes?: string[];
      navigation?: string[];
      talkTopics?: string[];
      objects?: string[];
      boundingBoxes?: string[];
    };
  };
  objectPropertyMap: {
    [itemId: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
      isInteractive: boolean;
      interactionId: string;
    };
  };
  bboxPropertyMap: {
    [itemId: string]: {
      x: number;
      y: number;
      width: number;
      height: number;
      isInteractive: boolean;
      interactionId: string;
    };
  };
  triggeredInteractions: { [interactionId: string]: boolean };
};

export type UserState = {
  collectibles: string[];
  achievements: string[];
};

export function gameStateToJson(
  prevGameState: FullGameState,
  chapterNum: number,
  gameStateManager: GameStateManager,
  userStateManager: GameUserStateManager
): FullGameState {
  const gameStoryState: GameStoryState = {
    chapterObjective: mapToJsObject(gameStateManager.getChapterObjectives().getObjectives()),
    locationStates: mapToJsObject(gameStateManager.getLocationStates()),
    objectPropertyMap: mapToJsObject(gameStateManager.getObjPropertyMap()),
    bboxPropertyMap: mapToJsObject(gameStateManager.getBBoxPropertyMap()),
    triggeredInteractions: mapToJsObject(gameStateManager.getTriggeredInteractions())
  };

  const userState: UserState = {
    collectibles: userStateManager.getList('collectibles'),
    achievements: userStateManager.getList('achievements')
  };

  const newGameStoryStates = { [chapterNum]: gameStoryState };

  const newGameState = {
    gameStoryStates: newGameStoryStates,
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
