import GameUserStateManager from './GameUserStateManager';
import GameStateManager from './GameStateManager';

export type FullGameState = {
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
  collectibles: string[];
  achievements: string[];
};

export type UserState = {};

export function gameStateToJson(
  gameStateManager: GameStateManager,
  userStateManager: GameUserStateManager
) {
  const gameState: FullGameState = {
    chapterObjective: {},
    locationStates: {},
    objectPropertyMap: {},
    bboxPropertyMap: {},
    collectibles: [],
    achievements: []
  };

  gameState.chapterObjective = mapToJsObject(
    gameStateManager.getChapterObjectives().getObjectives()
  );
  gameState.locationStates = mapToJsObject(gameStateManager.getLocationStates());
  gameState.objectPropertyMap = mapToJsObject(gameStateManager.getObjPropertyMap());
  gameState.bboxPropertyMap = mapToJsObject(gameStateManager.getBBoxPropertyMap());

  gameState.collectibles = userStateManager.getList('collectibles');
  gameState.achievements = userStateManager.getList('achievements');

  return gameState;
}

function mapToJsObject<K, V>(map: Map<K, V>): any {
  const jsObject = {};
  map.forEach((value: V, key: K) => {
    jsObject[(key as any) as string] = value;
  });
  return jsObject;
}
