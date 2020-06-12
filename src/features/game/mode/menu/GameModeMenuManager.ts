import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameModeMenu from 'src/features/game/mode/menu/GameModeMenu';
import { mapValues } from '../../utils/GameUtils';

class GameModeMenuManager {
  static processModeMenus(chapter: GameChapter): Map<string, GameModeMenu> {
    return mapValues(chapter.map.getLocations(), location => {
      if (!location.modes) {
        return;
      }
      return new GameModeMenu(location.name, location.modes);
    });
  }

  static processLocation(chapter: GameChapter, locationName: string): GameModeMenu {
    const location = chapter.map.getLocation(locationName);
    if (!location) {
      throw console.error('Location does not exist ', locationName);
    }
    return new GameModeMenu(location.name, location.modes);
  }
}

export default GameModeMenuManager;
