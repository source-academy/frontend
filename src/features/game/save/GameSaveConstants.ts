import { FullSaveState } from './GameSaveTypes';

export const emptySaveState: FullSaveState = {
  gameSaveStates: {},
  userState: {
    collectibles: [],
    achievements: [],
    settings: { volume: 1 },
    lastPlayedCheckpoint: [-1, -1],
    lastCompletedChapter: -1
  }
};
