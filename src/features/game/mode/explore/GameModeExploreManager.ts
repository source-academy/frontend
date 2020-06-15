import { GameMode } from '../GameModeTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeExplore from './GameModeExplore';
import { mapValues } from '../../utils/GameUtils';

class GameModeExploreManager {
  static processExploreMenus(chapter: GameChapter): Map<string, GameModeExplore> {
    return mapValues(chapter.map.getLocations(), location => {
      if (!location.modes || !location.modes.includes(GameMode.Explore)) {
        return;
      }
      return new GameModeExplore(location.name);
    });
  }

  static processLocation(chapter: GameChapter, locationName: string): GameModeExplore {
    const location = chapter.map.getLocation(locationName);
    if (!location) {
      throw console.error('Location does not exist ', locationName);
    }
    return new GameModeExplore(location.name);
  }
}

export default GameModeExploreManager;
