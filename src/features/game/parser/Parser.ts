import GameMap from '../location/GameMap';
import { splitByHeader, matchStartingKey, stripEnclosingChars } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';
import LocationParser from './LocationParser';
import ConfigParser from './ConfigParser';
import ObjectParser from './ObjectsParser';
import DialogueParser from './DialogueParser';
import GameObjective from '../objective/GameObjective';
// import LocationSelectChapter from '../scenes/LocationSelectChapter';

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

    // Split files by the <<>>
    splitByHeader(chapterText, /<<.+>>/).forEach(([fileName, fileContent]) => {
      if (!fileName || !fileContent) {
        return;
      }
      fileName = stripEnclosingChars(fileName, 2);
      const parserType = matchStartingKey(Parser.parserMap, fileName);
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
