import { LocationId, GameLocation, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import ObjectParser from './ObjectParser';
import BoundingBoxParser from './BoundingBoxParser';
import CharacterParser from './CharacterParser';
import ParserConverter from './ParserConverter';
import { GameAttr } from './ParserValidator';

export default class LocationParser {
  public static parse(locationId: LocationId, locationBody: string[]) {
    const location = Parser.checkpoint.map.getLocationAtId(locationId);
    const locationParagraphs = StringUtils.splitToParagraph(locationBody);

    locationParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0) {
        this.parseLocationConfig(location, header);
      } else {
        this.parseLocationParagraphs(location, header, body);
      }
    });
  }

  public static parseLocationConfig(location: GameLocation, locationConfig: string) {
    const [key, value] = StringUtils.splitByChar(locationConfig, ':');
    switch (key) {
      case 'modes':
        StringUtils.splitByChar(value, ',').forEach(mode => {
          const gameMode = ParserConverter.stringToGameMode(mode);
          location.modes.add(gameMode);
        });
        break;
      case 'bgm':
        location.bgmKey = value;
        break;
      case 'nav':
        StringUtils.splitByChar(value, ',').forEach(otherLocationId => {
          Parser.validator.assertAttr(GameAttr.locations, otherLocationId);
          location.navigation.add(otherLocationId);
        });
        break;
      case 'talkTopics':
        const talkTopics = StringUtils.splitByChar(value, ',');
        Parser.validator.assertLocAttrs(GameLocationAttr.talkTopics, talkTopics);
        location.talkTopics = new Set(talkTopics);
        break;
      default:
        throw new Error(`Invalid config key "${key}" specified under location "${location.id}"`);
    }
  }

  public static parseLocationParagraphs(location: GameLocation, header: string, body: string[]) {
    switch (header) {
      case 'objects':
        ObjectParser.parse(location.id, body);
        break;
      case 'boundingBoxes':
        BoundingBoxParser.parse(location.id, body);
        break;
      case 'characters':
        CharacterParser.parse(location.id, body);
        break;
      case 'actions':
        location.actionIds = ActionParser.parseActions(body);
        break;
      default:
        throw new Error(`Invalid location paragraph header "${header}"`);
    }
  }
}
