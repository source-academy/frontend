import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeTalk from './GameModeTalk';
import { GameMode } from '../GameModeTypes';
import { mapValues } from '../../utils/GameUtils';
import { GameItemTypeDetails } from '../../location/GameMapConstants';
import { LocationId } from '../../location/GameMapTypes';

class GameModeTalkManager {
  static processTalkMenus(chapter: GameChapter): Map<LocationId, GameModeTalk> {
    return mapValues(chapter.map.getLocations(), location => {
      const possibleDialogues = chapter.map.getItemAt(location.id, GameItemTypeDetails.Dialogue);
      if (
        !location.modes ||
        !location.modes.includes(GameMode.Talk) ||
        !possibleDialogues.size ||
        !location.talkTopics
      ) {
        return;
      }
      return new GameModeTalk(location.id, location.talkTopics, possibleDialogues);
    });
  }

  static processLocation(chapter: GameChapter, locationId: LocationId): GameModeTalk {
    const location = chapter.map.getLocation(locationId);
    if (!location) {
      throw console.error('Location does not exist ', locationId);
    }
    const possibleDialogues = chapter.map.getItemAt(location.id, GameItemTypeDetails.Dialogue);
    const talkTopics = location.talkTopics || [];
    return new GameModeTalk(location.id, talkTopics, possibleDialogues);
  }
}

export default GameModeTalkManager;
