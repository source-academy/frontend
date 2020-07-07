import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';
import DialoguesParser from './DialogueParser';
import LocationsParser from './LocationDetailsParser';
import LocationParser from './LocationParser';

import { GameCheckpoint } from '../chapter/GameChapterTypes';
import StringUtils from '../utils/StringUtils';
import ParserValidator, { GameAttr } from './ParserValidator';
import ActionParser from './ActionParser';

class Parser {
  public static checkpoint: GameCheckpoint;
  private static actionIdNum: number;
  public static validator: ParserValidator;

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

    Parser.validator = new ParserValidator();
  }

  public static parse(chapterText: string, continueParse = false): GameCheckpoint {
    if (!continueParse) {
      Parser.init();
    }

    const checkPointLines = StringUtils.splitToLines(chapterText);
    const checkPointParagraphs = StringUtils.splitToParagraph(checkPointLines);

    checkPointParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0 && header.includes(':')) {
        Parser.parseCheckpointConfig(header);
      } else {
        Parser.parseCheckpointParagraphs(header, body) || LocationParser.parse(header, body);
      }
    });

    Parser.validator.verifyAssertions();
    return this.checkpoint;
  }

  private static parseCheckpointConfig(checkpointConfig: string) {
    const [key, value] = StringUtils.splitByChar(checkpointConfig, ':');
    switch (key) {
      case 'startingLoc':
        Parser.validator.assertAttr(GameAttr.locations, value);
        Parser.checkpoint.startingLoc = value;
        break;
      default:
        throw new Error(`Invalid checkpoint config key, "${checkpointConfig}"`);
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
      case 'startActions':
        Parser.checkpoint.map.setStartActions(ActionParser.parseActions(body));
        break;
      case 'endActions':
        Parser.checkpoint.map.setEndActions(ActionParser.parseActions(body));
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
