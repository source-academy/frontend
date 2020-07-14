import { GameLocation, GameLocationAttr,LocationId } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import BoundingBoxParser from './BoundingBoxParser';
import CharacterParser from './CharacterParser';
import MusicParser from './MusicParser';
import ObjectParser from './ObjectParser';
import Parser from './Parser';
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
    const configValues = StringUtils.splitByChar(value, ',');
    switch (key) {
      case 'modes':
        configValues.forEach(mode => {
          const gameMode = ParserConverter.stringToGameMode(mode);
          location.modes.add(gameMode);
        });
        break;
      case 'nav':
        configValues.forEach(otherLocationId => {
          Parser.validator.assertAttr(GameAttr.locations, otherLocationId);
          location.navigation.add(otherLocationId);
        });
        break;
      case 'talkTopics':
        const talkTopics = configValues;
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
      case 'bgm':
        MusicParser.parse(location.id, body, GameSoundType.BGM);
        break;
      case 'sfx':
        MusicParser.parse(location.id, body, GameSoundType.SFX);
        break;
      case 'actions':
        location.actionIds = ActionParser.parseActions(body);
        break;
      default:
        throw new Error(`Invalid location paragraph header "${header}"`);
    }
  }
}
