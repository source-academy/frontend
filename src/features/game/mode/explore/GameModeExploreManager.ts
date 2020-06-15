import { GameMode } from '../GameModeTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeExplore from './GameModeExplore';
import { mapValues } from '../../utils/GameUtils';
import { LocationId } from '../../location/GameMapTypes';

class GameModeExploreManager {
  static processExploreMenus(chapter: GameChapter): Map<string, GameModeExplore> {
    return mapValues(chapter.map.getLocations(), location => {
      if (!location.modes || !location.modes.includes(GameMode.Explore)) {
        return;
      }
      return new GameModeExplore(location.id);
    });
  }

  static processLocation(chapter: GameChapter, locationId: LocationId): GameModeExplore {
    const location = chapter.map.getLocation(locationId);
    if (!location) {
      throw console.error('Location does not exist ', locationId);
    }
    return new GameModeExplore(location.id);
  }
}

export default GameModeExploreManager;
