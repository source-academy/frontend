import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';
import GameTask from '../task/GameTask';

/**
 * Encapsulates information about a checkpoint
 *
 * @prop {GameMap} map - set of locations and items that players can interact with in the checkpoint.
 * @prop {string} startingLoc - the location where player begins when he starts playing the checkpoints.
 * @prop {GameObjective} objectives - Objective object that stores all the objective ids and their state of completion during the game
 * @prop {GameTask} tasks - Task object that stores all the task ids, corresponding titles, descriptions, and their state of completion during the game
 */
export type GameCheckpoint = {
  map: GameMap;
  startingLoc: string;
  objectives: GameObjective;
  tasks: GameTask;
};

/**
 * Encapsulates information about a chapter
 *
 * @prop {string} title - title of the chapter as shown in Chapter Select
 * @prop {string} imageUrl - image preview of the chapter as shown in Chapter Select
 * @prop {string[]} filenames - the filenames of the checkpoint that comprise the chapter
 */
export type GameChapter = {
  imageUrl: string;
  title: string;
  filenames: string[];
};
