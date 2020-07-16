import { FullSaveState } from './GameSaveTypes';

/**
 * Function to create an empty save state
 * Used for resetting game data of students
 *
 * @returns {FullSaveState} - an empty save state for starting players
 */
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
