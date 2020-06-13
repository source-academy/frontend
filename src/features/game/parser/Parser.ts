import { GameChapter } from '../chapter/GameChapterTypes';
import LocationSelectChapter from '../scenes/LocationSelectChapter';
import GameMap from '../location/GameMap';
import { splitToLines, splitByHeader } from './StringUtils';
import { ParserType } from './ParserTypes';

class Parser {
  private parserMap = Map<ParserType, ParseFunction>

  public static parse(chapterText: string): GameChapter {
    const gameMap = new GameMap();
    const chapter = { configuration: '', map: gameMap, startingLoc: '' };

    this.parserMap = {
      'configuration': this.configParser
      
    }

    splitByHeader(chapterText, /<<.+>>/).forEach(([fileName, fileContent]) => {
      if (!fileName || !fileContent) {
        return;
      }

      switch (true) {
        case fileName.startsWith('configuration'):
          this.configParser(chapter, fileName, fileContent);
          break;
        case fileName.startsWith('location'):
          this.locationParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('modes'):
          this.modeParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('connectivity'):
          this.connectivityParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('objects'):
          this.objectParser(gameMap, fileName, fileContent);
          break;
        case fileName.startsWith('dialogue'):
          this.dialogueParser(gameMap, fileName, fileContent);
          break;
      }
    });

    return LocationSelectChapter;
  }

  public static configParser(chapter: GameChapter, fileName: string, fileContent: string) {
    const textFile = splitToLines(fileContent);
    const [, startingLoc] = textFile[0].split(': ');
    chapter.startingLoc = startingLoc;
  }

  public static locationParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static modeParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static connectivityParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static objectParser(gameMap: GameMap, fileName: string, fileContent: string) {}
  public static dialogueParser(gameMap: GameMap, fileName: string, fileContent: string) {}
}

export default Parser;
we do the Game
