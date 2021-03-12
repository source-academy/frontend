import { AssetType } from '../assets/AssetsTypes';
import { Character } from '../character/GameCharacterTypes';
import { AssetKey, ItemId } from '../commons/CommonTypes';
import { GameItemType, LocationId } from '../location/GameMapTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';
import ParserConverter from './ParserConverter';

/**
 * This class is in charge of parsing Character entities
 * from character lines
 */
export default class CharacterParser {
  /**
   * This class parses the character paragraph into
   * Characters and places them in the game map
   *
   * @param locationId Location where the character lines are found
   * @param characterList the list of character CSV lines
   */
  public static parse(locationId: LocationId, characterList: string[]) {
    characterList.forEach(characterDetails =>
      this.parseCharacterDetails(locationId, characterDetails)
    );
  }

  /**
   * Generates the asset key for a character and expression
   *
   * @param characterId the character's id, which is also the folder of the character in /avatars folder
   * @param expression the expression of the character, which is also present in filename
   */
  public static characterAssetKey(characterId: ItemId, expression: string) {
    return characterId + '-' + expression;
  }

  /**
   * Generates the short asset path for a character and an expression
   *
   * @param characterId the character's id, which is also the folder of the character in /avatars folder
   * @param expression the expression of the character, which is also present in filename
   */
  public static characterAssetPath(characterId: ItemId, expression: string) {
    return `/avatars/${characterId}/${characterId}.${expression}.png`;
  }

  /**
   * This function parses character CSVs and returns Characters
   * and places the characters inside the game map
   *
   * @param locationId the character's location
   * @param characterDetails the CSV string containing character details
   */
  private static parseCharacterDetails(locationId: LocationId, characterDetails: string) {
    const addToLoc = characterDetails[0] === '+';
    if (addToLoc) {
      characterDetails = characterDetails.slice(1);
    }

    const [id, name, defaultExpression, defaultPosition, scale] = StringUtils.splitByChar(
      characterDetails,
      ','
    );
    Parser.validator.registerId(id);

    const expressions = new Map<string, AssetKey>();

    const character: Character = {
      id,
      name,
      expressions,
      defaultExpression,
      defaultPosition: ParserConverter.stringToPosition(defaultPosition),
      scale: scale ? parseFloat(scale) : 1
    };

    // Add asset key to expression map
    expressions.set(defaultExpression, this.characterAssetKey(id, defaultExpression));

    // Add asset keys to expression map
    Parser.checkpoint.map.addMapAsset(this.characterAssetKey(id, defaultExpression), {
      type: AssetType.Image,
      path: this.characterAssetPath(id, defaultExpression),
      key: id
    });

    // Add character to map
    Parser.checkpoint.map.setItemInMap(GameItemType.characters, id, character);

    // Add character to location
    if (addToLoc) {
      Parser.checkpoint.map.addItemToLocation(locationId, GameItemType.characters, id);
    }
  }
}
