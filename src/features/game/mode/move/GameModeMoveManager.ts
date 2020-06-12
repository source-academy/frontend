import { GameMode } from '../GameModeTypes';
import GameModeMove from './GameModeMove';
import { GameChapter } from '../../chapter/GameChapterTypes';
import { mapValues } from '../../utils/GameUtils';

class GameModeMoveManager {
  static processMoveMenus(chapter: GameChapter): Map<string, GameModeMove> {
    return mapValues(chapter.map.getLocations(), location => {
      const navigation = chapter.map.getNavigationFrom(location.name);
      const locations = chapter.map.getLocations();
      if (!location.modes || !location.modes.includes(GameMode.Move) || !navigation) {
        return;
      }
      return new GameModeMove(location.name, navigation, locations);
    });
  }
}

export default GameModeMoveManager;
