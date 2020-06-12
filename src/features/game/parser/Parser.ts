import * as _ from 'lodash';

import { GameChapter } from '../chapter/GameChapterTypes';
import LocationSelectChapter from '../scenes/LocationSelectChapter';
import GameMap from '../location/GameMap';

class Parser {
  public static parse(text: string): GameChapter {
    const gameMap = new GameMap();
    const chapter = { configuration: null, map: gameMap, startingLoc: null };
    console.log(chapter);

    const fileNames = text.match(/<<.+>>/g);
    const contents = text.split(/<<.+>>/).slice(1);
    const files = _.zip(fileNames, contents);

    files.forEach(([fileName, fileContent]) => {
      if (!fileName || !fileContent) {
        return;
      }
      switch (true) {
        case fileName.startsWith('configuration'):
          this.configParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('location'):
          this.configParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('modes'):
          this.configParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('connectivity'):
          this.configParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('objects'):
          this.configParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('dialogue'):
          this.configParser(gameMap, fileName, fileContent);
          break;
      }
    });

    return LocationSelectChapter;
  }

  public static configParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static locationParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static modeParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static connectivityParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static objectParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static dialogueParser(gameMap: GameMap, fileName: string, fileContent: string) {}
}

export default Parser;
