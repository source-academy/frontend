export type FullSaveState = {
  gameSaveStates: { [chapterNum: number]: GameSaveState };
  userState: UserSaveState;
};

export type GameSaveState = {
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

export type UserSaveState = {
  settings: { volume: number };
  lastPlayedChapter: number;
  collectibles: string[];
  achievements: string[];
};
