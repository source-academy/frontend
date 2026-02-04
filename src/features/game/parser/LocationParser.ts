import { AssetType } from '../assets/AssetsTypes';
import { GameItemType, GameLocation, LocationId } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import StringUtils from '../utils/StringUtils';
import ActionParser from './ActionParser';
import BoundingBoxParser from './BoundingBoxParser';
import CharacterParser from './CharacterParser';
import MusicParser from './MusicParser';
import ObjectParser from './ObjectParser';
import Parser from './Parser';
import ParserConverter from './ParserConverter';
import { GameEntityType } from './ParserValidator';

/**
 * This class parses data for one specific location.
 */
export default class LocationParser {
  /**
   * This function reads the entire location body and
   * updates the location in the game map based on details inside
   * including charcters, objects, boundingBoxes etc.
   *
   * @param locationId The location id for the location to parse
   * @param locationBody The entire body of the location as string array
   */
  public static parse(locationId: LocationId, locationBody: string[]) {
    const location = Parser.checkpoint.map.getLocationAtId(locationId);
    const locationParagraphs = StringUtils.splitToParagraph(locationBody);

    locationParagraphs.forEach(([header, body]: [string, string[]]) => {
      if (body.length === 0 && header.includes(':')) {
        this.parseLocationConfig(location, header);
      } else {
        this.parseLocationParagraphs(location, header, body);
      }
    });
  }

  /**
   * This paragraph parses all the config details in a specific location
   * ie lines containing the ':' to specify gameplay details about the location
   *
   * @param location The reference game location that we want to update
   * @param locationConfig The config string about the location
   */
  private static parseLocationConfig(location: GameLocation, locationConfig: string) {
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
          Parser.validator.assertEntityType(GameEntityType.locations, otherLocationId);
          location.navigation.add(otherLocationId);
        });
        break;
      case 'talkTopics': {
        const talkTopics = configValues;
        Parser.validator.assertItemTypes(GameItemType.dialogues, talkTopics);
        location.talkTopics = new Set(talkTopics);
        break;
      }
      case 'preview': {
        const [previewPath] = configValues;
        if (previewPath) {
          const previewKey = '/preview' + previewPath;
          Parser.checkpoint.map.addMapAsset(previewKey, {
            type: AssetType.Image,
            key: location.id + 'Preview',
            path: previewPath
          });
          location.previewKey = previewKey;
        }
        break;
      }
      default:
        throw new Error(`Invalid config key "${key}" specified under location "${location.id}"`);
    }
  }

  /**
   * This paragraph parses all the paragraphs inside a specific location
   * ie lines paragraphs headed by 'objects', 'boundingBoxes', etc.
   *
   * @param location The reference game location that we want to update
   * @param entityHeader The header of the entity we want to parse in the location
   * @param body The body paragraph underneath the entity header
   */
  private static parseLocationParagraphs(
    location: GameLocation,
    entityHeader: string,
    body: string[]
  ) {
    switch (entityHeader) {
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
        throw new Error(`Invalid location paragraph header "${entityHeader}"`);
    }
  }
}
