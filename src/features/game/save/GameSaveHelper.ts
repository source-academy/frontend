import * as _ from 'lodash';

import { GameLocation, LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { UserStateTypes } from '../state/GameStateTypes';
import { FullSaveState, GameSaveState, SettingsJson, UserSaveState } from './GameSaveTypes';

/**
 * Function that obtains data from game manager,
 * game state manager, user state manager, as
 * well as phase manager and saves game data into Json 'snapshot' format
 *
 * @param prevGameState - the snapshot of the game the during the last save point
 * @param chapterNum - the chapterNumber of the game
 * @param checkpointNUm - the checkpoint of the game
 */
export function gameStateToJson(
  prevGameState: FullSaveState,
  chapterNum: number,
  checkpointNum: number
): FullSaveState {
  const gameManager = GameGlobalAPI.getInstance().getGameManager();
  const gameStateManager = gameManager.stateManager;
  const userStateManager = gameManager.userStateManager;
  const phaseManager = gameManager.phaseManager;

  const gameStoryState: GameSaveState = {
    currentLocation: gameManager.currentLocationId,
    currentPhase: phaseManager.getCurrentPhase(),
    chapterObjective: mapToJsObject(gameStateManager.getCheckpointObjectives().getObjectives()),
    locationStates: locationStatesToJson(gameStateManager.getLocationStates()),
    objectPropertyMap: mapToJsObject(gameStateManager.getObjPropertyMap()),
    bboxPropertyMap: mapToJsObject(gameStateManager.getBBoxPropertyMap()),
    triggeredInteractions: mapToJsObject(gameStateManager.getTriggeredInteractions()),
    lastCheckpointPlayed: checkpointNum
  };

  const userState: UserSaveState = {
    settings: { ...prevGameState.userState.settings },
    lastPlayedCheckpoint: [chapterNum, checkpointNum],
    collectibles: userStateManager.getList(UserStateTypes.collectibles),
    lastCompletedChapter:
      prevGameState.userState.lastCompletedChapter === undefined
        ? -1
        : prevGameState.userState.lastCompletedChapter
  };

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

function locationStatesToJson(map: Map<LocationId, GameLocation>): any {
  const jsObject = {};
  map.forEach((location: GameLocation, locationId: LocationId) => {
    const locationWithArrays = _.mapValues(location, locationProperty => {
      if (locationProperty instanceof Set) {
        return Array.from(locationProperty);
      }
      return locationProperty;
    });
    jsObject[locationId] = locationWithArrays;
  });
  return jsObject;
}

export function jsonToLocationStates(obj: any): Map<LocationId, GameLocation> {
  const map = new Map<LocationId, any>();

  if (Object.keys(obj).length) {
    Object.keys(obj).forEach((locationId: LocationId) => {
      const locationWithSets = _.mapValues(obj[locationId], locationProperty => {
        if (locationProperty instanceof Array) {
          return new Set(locationProperty);
        }
        return locationProperty;
      });

      map.set(locationId, locationWithSets);
    });
  }

  return map;
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
