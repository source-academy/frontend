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

    switch (key) {
      case 'modes':
        const gameModes = StringUtils.splitByChar(value, ',').map(mode =>
          ParserConverter.stringToGameMode(mode)
        );
        Parser.checkpoint.map.setModesAt(locationId, gameModes);
        break;
      case 'nav':
        const connectedLocations = StringUtils.splitByChar(value, ',');
        Parser.checkpoint.map.setNavigationFrom(locationId, connectedLocations);
        break;
      case 'talkTopics':
        const talkTopics = StringUtils.splitByChar(value, ',');
        Parser.checkpoint.map.getLocationAtId(locationId).talkTopics = talkTopics;
        break;
      case 'actions':
        const actions = StringUtils.splitByChar(value, ',');
        Parser.checkpoint.map.getLocationAtId(locationId).actionIds = ActionParser.parseActions(
          actions
        );
        break;
      default:
        console.error('Invalid location config key');
        break;
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
        console.error('Invalid location paragraph header');
        break;
    }
  }
}
