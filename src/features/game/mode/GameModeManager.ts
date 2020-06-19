import { IGameUI } from '../commons/CommonsTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import { LocationId, GameLocation } from '../location/GameMapTypes';
import GameModeMenu from './menu/GameModeMenu';
import GameModeTalk from './talk/GameModeTalk';
import GameModeMove from './move/GameModeMove';
import GameModeExplore from './explore/GameModeExplore';
import { GameChapter } from '../chapter/GameChapterTypes';

class GameModeManager {
  private gameModes: Map<LocationId, Map<GameMode, IGameUI>>;

  constructor() {
    this.gameModes = new Map<LocationId, Map<GameMode, IGameUI>>();
  }

  public initialise(chapter: GameChapter) {
    chapter.map.getLocations().forEach((location: GameLocation) => {
      if (!location.modes) {
        throw new Error(`Location ${location.id} does not have any modes`);
      }

      const locationModes = new Map<GameMode, IGameUI>();

      [GameMode.Menu, ...location.modes].forEach(mode => {
        locationModes.set(mode, this.createMode(location.id, mode));
      });

      this.gameModes.set(location.id, locationModes);
    });
  }

  private createMode(locationId: LocationId, mode: GameMode): IGameUI {
    switch (mode) {
      case GameMode.Menu:
        return new GameModeMenu(locationId);
      case GameMode.Talk:
        return new GameModeTalk(locationId);
      case GameMode.Move:
        return new GameModeMove(locationId);
      case GameMode.Explore:
        return new GameModeExplore(locationId);
    }
  }

  public addMode(locationId: LocationId, mode: GameMode) {
    this.gameModes.get(locationId)!.set(mode, this.createMode(locationId, mode));
  }

  public removeMode(locationId: LocationId, mode: GameMode) {
    this.gameModes.get(locationId)!.delete(mode);
  }

  public getLocationMode(mode: GameMode, locationId: LocationId): IGameUI | undefined {
    return this.gameModes.get(locationId)!.get(mode);
  }
}

export default GameModeManager;
