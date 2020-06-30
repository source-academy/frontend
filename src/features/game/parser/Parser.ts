import LocationParser from './LocationParser';
import ConfigParser from './ConfigParser';
import ObjectParser from './ObjectParser';
import DialogueParser from './DialogueParser';
import CharacterParser from './CharacterParser';
import BoundingBoxParser from './BoundingBoxParser';
import ObjectiveParser from './ObjectiveParser';
import CollectibleParser from './CollectibleParser';
import AssetParser from './AssetParser';

import { GameCheckpoint } from '../chapter/GameChapterTypes';
import { splitByHeader, matchStartingKey, stripEnclosingChars } from './ParserHelper';
import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';

class Parser {
  private static parserMap: object;
  public static checkpoint: GameCheckpoint;
  private static actionIdNum: number;

  public static generateActionId() {
    Parser.actionIdNum++;
    return `action#${Parser.actionIdNum}`;
  }

  public static init() {
    Parser.actionIdNum = 0;

    Parser.parserMap = {
      configuration: ConfigParser,
      location: LocationParser,
      objects: ObjectParser,
      dialogue: DialogueParser,
      characters: CharacterParser,
      boundingBoxes: BoundingBoxParser,
      objectives: ObjectiveParser,
      collectibles: CollectibleParser,
      assets: AssetParser
    };

    Parser.checkpoint = {
      configuration: '',
      map: new GameMap(),
      startingLoc: '',
      objectives: new GameObjective()
    };
  }

  public static parse(chapterText: string, continueParse = false): GameCheckpoint {
    if (!continueParse) {
      Parser.init();
    }

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

    return this.checkpoint;
  }
}

export default Parser;
