import StringUtils from '../utils/StringUtils';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import { Character } from '../character/GameCharacterTypes';
import { AssetKey, ItemId } from '../commons/CommonsTypes';
import ParserConverter from './ParserConverter';

export default class CharacterParser {
  public static parse(locationId: LocationId, characterList: string[]) {
    characterList.forEach(characterDetails =>
      this.parseCharacterDetails(locationId, characterDetails)
    );
  }

  public static characterAssetKey(characterId: ItemId, expression: string) {
    return characterId + expression;
  }

  public static characterAssetValue(characterId: ItemId, expression: string) {
    return `/avatars/${characterId}/${characterId}.${expression}.png`;
  }

  private static parseCharacterDetails(locationId: LocationId, characterDetails: string) {
    const addToLoc = characterDetails[0] === '+';
    if (addToLoc) {
      characterDetails = characterDetails.slice(1);
    }

    const [id, name, defaultExpression, defaultPosition] = StringUtils.splitByChar(
      characterDetails,
      ','
    );

    const expressions = new Map<string, AssetKey>();

    const character: Character = {
      id,
      name,
      expressions,
      defaultExpression,
      defaultPosition: ParserConverter.stringToCharPosition(defaultPosition)
    };

    // Add asset key to expression map
    expressions.set(defaultExpression, this.characterAssetKey(id, defaultExpression));

    console.log(id, defaultExpression);
    // Add asset keys to expression map
    Parser.checkpoint.map.addMapAsset(
      this.characterAssetKey(id, defaultExpression),
      this.characterAssetValue(id, defaultExpression)
    );

    // Add character to map
    Parser.checkpoint.map.addItemToMap(GameLocationAttr.characters, id, character);

    // Add character to location
    if (addToLoc) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.characters, id);
    }
  }
}
