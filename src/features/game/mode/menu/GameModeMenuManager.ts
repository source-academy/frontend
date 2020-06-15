import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameModeMenu from 'src/features/game/mode/menu/GameModeMenu';
import { mapValues } from '../../utils/GameUtils';
import { LocationId } from '../../location/GameMapTypes';

class GameModeMenuManager {
  static processModeMenus(chapter: GameChapter): Map<string, GameModeMenu> {
    return mapValues(chapter.map.getLocations(), location => {
      if (!location.modes) {
        return;
      }
      return new GameModeMenu(location.id, location.modes);
    });
  }

  static processLocation(chapter: GameChapter, locationId: LocationId): GameModeMenu {
    const location = chapter.map.getLocation(locationId);
    if (!location) {
      throw console.error('Location does not exist ', locationId);
    }
    return new GameModeMenu(location.id, location.modes);
  }
}

export default GameModeMenuManager;
