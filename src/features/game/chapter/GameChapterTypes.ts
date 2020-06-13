import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';

export type GameChapter = {
  configuration?: any;
  map: GameMap;
  startingLoc: string;
  objectives: GameObjective;
};
