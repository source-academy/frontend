import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeTalk from './GameModeTalk';
import { GameMode } from '../GameModeTypes';
import { mapValues } from '../../utils/GameUtils';
import { LocationId } from '../../commons/CommonsTypes';
import { GameItemTypeDetails } from '../../location/GameMapTypes';

class GameModeTalkManager {
  static processTalkMenus(chapter: GameChapter): Map<LocationId, GameModeTalk> {
    return mapValues(chapter.map.getLocations(), location => {
      const possibleDialogues = chapter.map.getItemAt(location.name, GameItemTypeDetails.Dialogue);
      if (!location.modes || !location.modes.includes(GameMode.Talk) || !possibleDialogues.size) {
        return;
      }
      return new GameModeTalk(possibleDialogues);
    });
  }
}

export default GameModeTalkManager;
