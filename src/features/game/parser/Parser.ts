import GameMap from '../location/GameMap';
import { splitByHeader, matchStartingKey, stripEnclosingChars } from './StringUtils';
import { GameChapter } from '../chapter/GameChapterTypes';
import LocationParser from './LocationParser';
import ConfigParser from './ConfigParser';
import ObjectParser from './ObjectsParser';
import DialogueParser from './DialogueParser';
import GameObjective from '../objective/GameObjective';

class Parser {
  private static parserMap: object;

  public static parse(chapterText: string): GameChapter {
    Parser.parserMap = {
      configuration: ConfigParser,
      location: LocationParser,
      objects: ObjectParser,
      dialogue: DialogueParser
    };

    const chapter = {
      configuration: '',
      map: new GameMap(),
      startingLoc: '',
      objectives: new GameObjective()
    };
    splitByHeader(chapterText, /<<.+>>/).forEach(([fileName, fileContent]) => {
      if (!fileName || !fileContent) {
        return;
      }

      const parserType = matchStartingKey(Parser.parserMap, stripEnclosingChars(fileName, 2));
      if (!parserType) {
        throw new Error('Unknown parser type');
      }
      const parserFunction = Parser.parserMap[parserType];
      parserFunction(chapter, fileName, fileContent);
    });

    return chapter;
  }
}

export default Parser;
