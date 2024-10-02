import { GameCheckpoint } from '../chapter/GameChapterTypes';
import GameMap from '../location/GameMap';
import GameObjective from '../objective/GameObjective';
import GameTask from '../task/GameTask';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import DialoguesParser from './DialogueParser';
import LocationsParser from './LocationDetailsParser';
import LocationParser from './LocationParser';
import ParserValidator, { GameEntityType } from './ParserValidator';
import QuizParser from './QuizParser';
import TasksParser from './TasksParser';

/**
 * This class converts a checkpoint txt file into a Checkpoint
 * object.
 *
 * A Checkpoint object encapsulates data about the map including all
 * the locations inside it, as well as the objectives in that checkpoint,
 * basically everything the game engine needs to know to render
 * the entire checkpoint for players to play.
 *
 */
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
      map: new GameMap(),
      startingLoc: '',
      objectives: new GameObjective(),
      tasks: new GameTask()
    };

    Parser.validator = new ParserValidator();
  }

  public static parse(chapterText: string, continueParse = false) {
    if (!continueParse) {
      Parser.init();
    }

    const checkPointLines = StringUtils.splitToLinesAndRemoveComments(chapterText);
    const checkPointParagraphs = StringUtils.splitToParagraph(checkPointLines);

    checkPointParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0 && header.includes(':')) {
        Parser.parseCheckpointConfig(header);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        Parser.parseCheckpointParagraphs(header, body) || LocationParser.parse(header, body);
      }
    });

    Parser.validator.verifyAssertions();
  }

  private static parseCheckpointConfig(checkpointConfig: string) {
    const [key, value] = StringUtils.splitByChar(checkpointConfig, ':');
    switch (key) {
      case 'startingLoc':
        Parser.validator.assertEntityType(GameEntityType.locations, value);
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
      case 'tasks':
        TasksParser.parse(body);
        break;
      case 'locations':
        LocationsParser.parse(body);
        break;
      case 'gameStartActions':
        Parser.checkpoint.map.setGameStartActions(ActionParser.parseActions(body));
        break;
      case 'checkpointCompleteActions':
        Parser.checkpoint.map.setCheckpointCompleteActions(ActionParser.parseActions(body));
        break;
      case 'dialogues':
        DialoguesParser.parse(body);
        break;
      case 'quizzes':
        QuizParser.parse(body);
        break;
      default:
        return false;
    }
    return true;
  }
}

export default Parser;
