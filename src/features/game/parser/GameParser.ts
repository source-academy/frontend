import { GameChapter } from '../chapter/GameChapterTypes';
import LocationSelectChapter from '../scenes/LocationSelectChapter';

export class GameParser {
  public static parse(text: string): GameChapter {
    return LocationSelectChapter;
  }
}
