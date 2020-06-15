import GameMap from '../location/GameMap';
import { splitByHeader, matchStartingKey, stripEnclosingChars } from './ParserHelper';
import { GameChapter } from '../chapter/GameChapterTypes';
import LocationParser from './LocationParser';
import ConfigParser from './ConfigParser';
import ObjectParser from './ObjectsParser';
import DialogueParser from './DialogueParser';
import GameObjective from '../objective/GameObjective';
import CharacterParser from './CharacterParser';
import BoundingBoxParser from './BoundingBoxParser';
import ObjectiveParser from './ObjectiveParser';

class Parser {
  private static parserMap: object;
  public static chapter: GameChapter;

  constructor() {
    Parser.parserMap = {
      configuration: ConfigParser,
      location: LocationParser,
      objects: ObjectParser,
      dialogue: DialogueParser,
      characters: CharacterParser,
      boundingBoxes: BoundingBoxParser,
      objectives: ObjectiveParser
    };

    Parser.chapter = {
      configuration: '',
      map: new GameMap(),
      startingLoc: '',
      objectives: new GameObjective()
    };
  }

  public static parse(chapterText: string): GameChapter {
    // Split files by the <<>>
    splitByHeader(chapterText, /<<.+>>/).forEach(([fileName, fileContent]) => {
      if (!fileName || !fileContent) {
        return;
      }
      fileName = stripEnclosingChars(fileName, 2);
      const parserType = matchStartingKey(Parser.parserMap, fileName);
      if (!parserType) {
        throw new Error(`Unknown parser type ${fileName}`);
      }
      const parserFunction = Parser.parserMap[parserType];
      parserFunction(fileName, fileContent);
    });

    return this.chapter;
  }
}

export default Parser;
