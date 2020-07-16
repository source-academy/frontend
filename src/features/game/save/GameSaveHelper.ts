import * as _ from 'lodash';

import { GameLocation, LocationId } from '../location/GameMapTypes';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { FullSaveState, GameSaveState, SettingsJson, UserSaveState } from './GameSaveTypes';

/**
 * Function that saves game data as a 'snapshot' in FullSaveState
 * json format by collecting game data from game manager,
 * game state manager, user state manager, and phase manager
 *
 * @param prevGameState - the snapshot of the game the during the last save point
 * @param chapterNum - the chapterNumber of the game
 * @param checkpointNUm - the checkpoint of the game
 * @returns {FullSaveState} - the new 'snapshot' of the game
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

  const userSaveState: UserSaveState = {
    settings: { ...prevGameState.userSaveState.settings },
    lastPlayedCheckpoint: [chapterNum, checkpointNum],
    collectibles: userStateManager.getList('collectibles'),
    lastCompletedChapter:
      prevGameState.userSaveState.lastCompletedChapter === undefined
        ? -1
        : prevGameState.userSaveState.lastCompletedChapter
  };

  const newGameStoryStates = { ...prevGameState.gameSaveStates, [chapterNum]: gameStoryState };

  const newGameState = {
    gameSaveStates: newGameStoryStates,
    userSaveState
  };

  return newGameState;
}

/**
 * Function that saves user settings into FullSaveState
 * by overwriting just the settings portion of the game
 *
 * @param prevGameState - the snapshot of the game the during the last save point
 * @param settingsJson - the settings to be saved
 * @returns {FullSaveState} - the new snapshot of the game
 */
export function userSettingsToJson(
  prevGameState: FullSaveState,
  settingsJson: SettingsJson
): FullSaveState {
  const newGameState = {
    gameSaveStates: prevGameState.gameSaveStates,
    userSaveState: { ...prevGameState.userSaveState, settings: settingsJson }
  };

  return newGameState;
}

/**
 * Converts a javascript Map into object format
 *
 * @param map - Javascript Map that you want to convert
 * @returns {object} - Map as an object format
 */
function mapToJsObject<K, V>(map: Map<K, V>): any {
  const jsObject = {};
  map.forEach((value: V, key: K) => {
    jsObject[(key as any) as string] = value;
  });
  return jsObject;
}

/**
 * Converts a an object into javascript Map format
 *
 * @param obj - Object that you want to convert
 * @returns {Map<string, any>} - Map as a json format
 */
export function jsObjectToMap(obj: any): Map<string, any> {
  const map = new Map<string, any>();

  if (Object.keys(obj).length) {
    Object.keys(obj).forEach((key: string) => {
      map.set(key, obj[key]);
    });
  }

  return map;
}

/**
 * Converts the locationStates Map into a json object
 *
 * @param locationStates - location states map
 * @returns {object} - The location states map as an object
 */
function locationStatesToJson(locationStates: Map<LocationId, GameLocation>): any {
  const jsObject = {};
  locationStates.forEach((location: GameLocation, locationId: LocationId) => {
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

/**
 * Converts the locationStates from a saved json object to a map that can be played
 *
 * @param obj - location states map as a json object
 * @returns {Map<LocationId, GameLocation>} - The location states map as a json object
 */
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

/**
 * Function to create an empty save state
 * Used for resetting game data of students
 *
 * @returns {FullSaveState} - an empty save state for starting players
 */
export const createEmptySaveState = (): FullSaveState => {
  return {
    gameSaveStates: {},
    userSaveState: {
      collectibles: [],
      settings: { volume: 1 },
      lastPlayedCheckpoint: [-1, -1],
      lastCompletedChapter: -1
    }
  };
};
