import { LocationId } from '../location/GameMapTypes';
import Parser from './Parser';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import ObjectParser from './ObjectParser';
import BoundingBoxParser from './BoundingBoxParser';
import CharacterParser from './CharacterParser';
import ParserConverter from './ParserConverter';

export default class LocationParser {
  public static parse(locationId: LocationId, locationBody: string[]) {
    const locationParagraphs = StringUtils.splitToParagraph(locationBody);

    locationParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0) {
        this.parseLocationConfig(locationId, header);
      } else {
        this.parseLocationParagraphs(locationId, header, body);
      }
    });
  }

  public static parseLocationConfig(locationId: LocationId, locationConfig: string) {
    const [key, value] = StringUtils.splitByChar(locationConfig, ':');
    const location = Parser.checkpoint.map.getLocationAtId(locationId);
    switch (key) {
      case 'modes':
        !location.modes && (location.modes = []);
        StringUtils.splitByChar(value, ',').forEach(mode => {
          const gameMode = ParserConverter.stringToGameMode(mode);
          location.modes!.push(gameMode);
        });
        break;
      case 'nav':
        !location.navigation && (location.navigation = []);
        StringUtils.splitByChar(value, ',').forEach(otherLocationId => {
          location.navigation!.push(otherLocationId);
        });
        break;
      case 'talkTopics':
        const talkTopics = StringUtils.splitByChar(value, ',');
        location.talkTopics = talkTopics;
        break;
      case 'actions':
        const actions = StringUtils.splitByChar(value, ',');
        location.actionIds = ActionParser.parseActions(actions);
        break;
      default:
        throw new Error(`Invalid location config key ${key}`);
    }
  }

  public static parseLocationParagraphs(locationId: LocationId, header: string, body: string[]) {
    switch (header) {
      case 'objects':
        ObjectParser.parse(locationId, body);
        break;
      case 'boundingBoxes':
        BoundingBoxParser.parse(locationId, body);
        break;
      case 'characters':
        CharacterParser.parse(locationId, body);
        break;
      default:
        throw new Error(`Invalid location paragraph header ${header}`);
    }
  }
}
