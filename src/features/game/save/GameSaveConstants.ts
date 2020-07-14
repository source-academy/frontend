import { FullSaveState } from './GameSaveTypes';

export const createEmptySaveState = (): FullSaveState => {
  return {
    gameSaveStates: {},
    userState: {
      collectibles: [],
      settings: { volume: 1 },
      lastPlayedCheckpoint: [-1, -1],
      lastCompletedChapter: -1
    }
  };
};
