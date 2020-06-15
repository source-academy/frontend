import { GameMode } from '../GameModeTypes';
import GameModeMove from './GameModeMove';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { mapValues } from '../../utils/GameUtils';
import { LocationId } from '../../location/GameMapTypes';

class GameModeMoveManager {
  static processMoveMenus(chapter: GameChapter): Map<string, GameModeMove> {
    return mapValues(chapter.map.getLocations(), location => {
      const navigation = chapter.map.getNavigationFrom(location.id);
      const locations = chapter.map.getLocations();
      if (!location.modes || !location.modes.includes(GameMode.Move) || !navigation) {
        return;
      }
      return new GameModeMove(location.id, navigation, locations);
    });
  }

  static processLocation(chapter: GameChapter, locationId: LocationId): GameModeMove {
    const location = chapter.map.getLocation(locationId);
    if (!location) {
      throw console.error('Location does not exist ', locationId);
    }
    const navigation = chapter.map.getNavigationFrom(locationId) || [];
    const locations = chapter.map.getLocations();
    return new GameModeMove(location.id, navigation, locations);
  }
}

export default GameModeMoveManager;
