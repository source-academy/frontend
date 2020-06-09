import GameMap from '../location/GameMap';

export type GameChapter = {
  configuration?: any;
  map: GameMap;
  startingLoc: string;
};
