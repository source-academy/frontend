import { GameMode } from '../GameModeTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeExplore from './GameModeExplore';
import { GameLocation } from '../../location/GameMapTypes';
import { mapValues } from '../../utils/GameUtils';

class GameModeExploreManager {
  static processExploreMenus(chapter: GameChapter): Map<string, GameModeExplore> {
    return mapValues(chapter.map.getLocations(), location => this.createGameModeExplore(location));
  }

  private static createGameModeExplore(location: GameLocation) {
    if (!location.modes || !location.modes.find(mode => mode === GameMode.Explore)) {
      return;
    }
    const exploreMenu = new GameModeExplore(location);
    return exploreMenu;
  }
}

export default GameModeExploreManager;
