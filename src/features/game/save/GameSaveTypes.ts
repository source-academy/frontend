/**
 * This type determines the various behaviours of the polymorphic
 * Save Manager
 */
export enum SaveManagerType {
  Game = 'Game',
  Settings = 'Settings',
  Simulator = 'Simulator',
  None = 'None'
}

/**
 * @typedef {FullSaveState} - this type encapsulates the the entire json object
 * that is being saved in the backend
 *
 * @prop {Object<number, GameSaveState>} gameSaveStates - the object that stores game state of player at every chapter
 *                                                        it only stores the game state at every last checkpoint of the chapter
 * @prop {UserSaveState} userState - the object that stores settings about the user, available regardless of which chapter
 */
export type FullSaveState = {
  gameSaveStates: { [chapterNum: number]: GameSaveState };
  userState: UserSaveState;
};

/**
 * @typedef {GameSaveState} - this encapsulates data of students' progress in the game in one checkpoint
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

export type UserSaveState = {
  settings: SettingsJson;
  lastPlayedCheckpoint: [number, number];
  collectibles: string[];
  lastCompletedChapter: number;
};

export type SettingsJson = {
  volume: any;
};
