export enum SaveManagerType {
  Game = 'Game',
  Settings = 'Settings',
  Simulator = 'Simulator',
  None = 'None'
}

export type FullSaveState = {
  gameSaveStates: { [chapterNum: number]: GameSaveState };
  userState: UserSaveState;
};

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
