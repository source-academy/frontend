import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';
import DialoguesParser from './DialoguesParser';
import LocationsParser from './LocationsParser';
import LocationParser from './LocationParser';

import { GameCheckpoint } from '../chapter/GameChapterTypes';
import StringUtils from '../utils/StringUtils';

class Parser {
  public static checkpoint: GameCheckpoint;
  private static actionIdNum: number;

  public static generateActionId() {
    Parser.actionIdNum++;
    return `action#${Parser.actionIdNum}`;
  }

  public static init() {
    Parser.actionIdNum = 0;

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

    const checkPointLines = StringUtils.splitToLines(chapterText);
    const checkPointParagraphs = StringUtils.splitToParagraph(checkPointLines);

    checkPointParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0) {
        Parser.parseCheckpointConfig(header);
      } else {
        Parser.parseCheckpointParagraphs(header, body) || LocationParser.parse(header, body);
      }
    });

    return this.checkpoint;
  }

  private static parseCheckpointConfig(checkpointConfig: string) {
    const [key, value] = StringUtils.splitByChar(checkpointConfig, ':');
    switch (key) {
      case 'startingLoc':
        Parser.checkpoint.startingLoc = value;
        break;
      default:
        console.error('Invalid checkpoint config key');
        break;
    }
  }

  private static parseCheckpointParagraphs(header: string, body: string[]) {
    switch (header) {
      case 'objectives':
        Parser.checkpoint.objectives.addObjectives(body);
        break;
      case 'locations':
        LocationsParser.parse(body);
        break;
      case 'dialogues':
        DialoguesParser.parse(body);
        break;
      default:
        return false;
    }
    return true;
  }
}

export default Parser;
