/**
 * @typedef {FullSaveState} - this type encapsulates the the entire json object
 * that is being saved in the backend
 * @prop {Object<number, GameSaveState>} gameSaveStates - the object that stores game state of player at every last played checkpoint of the chapter
 * @prop {UserSaveState} userSaveState - the object that stores settings and information about the player, available regardless of which chapter they are at
 */
export type FullSaveState = {
  gameSaveStates: { [chapterNum: number]: GameSaveState };
  userSaveState: UserSaveState;
};

/**
 * @typedef {GameSaveState} - this encapsulates data of students' progress in the game in one checkpoint
 * @prop {string} currentLocation - location of student during save
 * @prop {string} currentPhase - phase student is in during last save
 * @prop {Object<string, boolean>} chapterObjective - object where the keys are objective ids and value is whether or not student have completed the objective
 * @prop {number} lastCheckpointPlayed - the last checkpoint played in the chapter
 * @prop {Object<LocationId, Location>} locationStates - information about each location as of the save point
 * @prop {Object<ItemId, ObjectProperty>} objectPropertyMap - information about each object in the map as of the save point
 * @prop {Object<ItemId, BBoxProperty>} bboxPropertyMap - information about each bounding box in the map as of the save point
 * @prop {Object<string, boolean>} triggeredInteractions - object where keys are interactionIds and values are whether or not these interactions have been triggered
 */
export type GameSaveState = {
  currentLocation: string;
  currentPhase: string;
  chapterObjective: { [objective: string]: boolean };
  lastCheckpointPlayed: number;
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

/**
 * @typedef {UserSaveState} - this encapsulates data about students player account throughout the game
 * @prop {SettingsJson} settings - settings json object that contains user settings
 * @prop {[number, number]} lastPlayedCheckpoint - the chapter and checkpoint where the student left off (can be used for continue game)
 * @prop {string[]} collectibles - the ItemIds of all collectibles that students have completed
 * @prop {number} lastCompletedChapter - the largest chapter number which the students have played (used black tinting chapters in chapter select)
 */
export type UserSaveState = {
  settings: SettingsJson;
  lastPlayedCheckpoint: [number, number];
  collectibles: string[];
  lastCompletedChapter: number;
};

/**
 * @typedef {SettingsJson} - this encapsulates data about students settings
 * @prop {number} volume - volume that students play the game with
 */
export type SettingsJson = {
  volume: number;
};
