import { GameMode } from '../GameModeTypes';
import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeExplore from './GameModeExplore';
import { mapValues } from '../../utils/GameUtils';
import { GameItemTypeDetails } from '../../location/GameMapConstants';

class GameModeExploreManager {
  static processExploreMenus(chapter: GameChapter): Map<string, GameModeExplore> {
    return mapValues(chapter.map.getLocations(), location => {
      const boundingBoxes = chapter.map.getItemAt(location.name, GameItemTypeDetails.BBox);
      if (!location.modes || !location.modes.includes(GameMode.Explore)) {
        return;
      }
      return new GameModeExplore(location.name, location.boundingBoxes, boundingBoxes);
    });
  }

  static processLocation(chapter: GameChapter, locationName: string): GameModeExplore {
    const location = chapter.map.getLocation(locationName);
    if (!location) {
      throw console.error('Location does not exist ', locationName);
    }
    const boundingBoxes = chapter.map.getItemAt(location.name, GameItemTypeDetails.BBox);
    return new GameModeExplore(location.name, location.boundingBoxes, boundingBoxes);
  }
}

export default GameModeExploreManager;
