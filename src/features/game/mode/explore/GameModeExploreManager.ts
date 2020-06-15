import { GameMode } from '../GameModeTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeExplore from './GameModeExplore';
import { mapValues } from '../../utils/GameUtils';
import { GameItemTypeDetails } from '../../location/GameMapConstants';
import { LocationId } from '../../location/GameMapTypes';

class GameModeExploreManager {
  static processExploreMenus(chapter: GameChapter): Map<string, GameModeExplore> {
    return mapValues(chapter.map.getLocations(), location => {
      const boundingBoxes = chapter.map.getItemAt(location.id, GameItemTypeDetails.BBox);
      if (!location.modes || !location.modes.includes(GameMode.Explore)) {
        return;
      }
      return new GameModeExplore(location.id, location.boundingBoxes, boundingBoxes);
    });
  }

  static processLocation(chapter: GameChapter, locationId: LocationId): GameModeExplore {
    const location = chapter.map.getLocation(locationId);
    if (!location) {
      throw console.error('Location does not exist ', locationId);
    }
    const boundingBoxes = chapter.map.getItemAt(location.id, GameItemTypeDetails.BBox);
    return new GameModeExplore(location.id, location.boundingBoxes, boundingBoxes);
  }
}

export default GameModeExploreManager;
