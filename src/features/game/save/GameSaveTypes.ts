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
 * @prop {number} lastCheckpointPlayed - the last checkpoint played in the chapter
 * @prop {string} currentLocation - location of student during save
 * @prop {string} currentPhase - phase student is in during last save
 *
 * @prop {string[]} incompleteTasks - list of tasks that have been displayed but yet to be completed by player
 * @prop {string[]} completedTasks - list of tasks that have been completed by player
 * @prop {string[]} completedObjectives - list of objectives that have been completed by player
 * @prop {string[]} triggeredInteractions - list of itemIds that have been triggered by player
 * @prop {string[]} triggeredActions - list of actions that have been triggered by player
 * @prop {[string, number][]} quizScores - list of quiz ids and the corresponding quiz scores for a user
 */
export type GameSaveState = {
  lastCheckpointPlayed: number;
  currentLocation: string | undefined;
  currentPhase: string;
  chapterNewlyCompleted: boolean;

  incompleteTasks: string[];
  completedTasks: string[];
  completedObjectives: string[];
  triggeredInteractions: string[];
  triggeredStateChangeActions: string[];
  quizScores: [string, number][];
};

/**
 * @typedef {UserSaveState} - this encapsulates data about students player account throughout the game
 * @prop {SettingsJson} settings - settings json object that contains user settings
 * @prop {[number, number]} recentlyPlayedCheckpoint - the chapter and checkpoint where the student left off (can be used for continue game)
 * @prop {string[]} collectibles - the ItemIds of all collectibles that students have completed
 * @prop {number} largestCompletedChapter - the largest chapter number which the students have played (used black tinting chapters in chapter select)
 */
export type UserSaveState = {
  settings: SettingsJson;
  recentlyPlayedCheckpoint: [number, number];
  collectibles: string[];
  largestCompletedChapter: number;
};

/**
 * @typedef {SettingsJson} - this encapsulates data about students settings
 * @prop {number} volume - volume that students play the game with
 */
export type SettingsJson = {
  bgmVolume: number;
  sfxVolume: number;
};
