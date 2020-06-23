import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';

export type GameCheckpoint = {
  configuration?: any;
  map: GameMap;
  startingLoc: string;
  objectives: GameObjective;
};

export type GameChapter = {
  title: string;
  previewBgPath: string;
  checkpointsFilenames: string[];
};
