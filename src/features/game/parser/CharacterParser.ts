import StringUtils from '../utils/StringUtils';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import { Character } from '../character/GameCharacterTypes';
import { textToPositionMap } from './DialogueParser';
import { AssetKey, ItemId } from '../commons/CommonsTypes';
import { Constants } from '../commons/CommonConstants';

export function characterAssetKey(characterId: ItemId, expression: string) {
  return characterId + expression;
}

export function characterAssetValue(characterId: ItemId, expression: string) {
  return `${Constants.assetsFolder}/avatars/${characterId}/${characterId}.${expression}.png`;
}

export default class CharacterParser {
  public static parse(locationId: LocationId, characterList: string[]) {
    characterList.forEach(characterDetails =>
      this.parseCharacterDetails(locationId, characterDetails)
    );
  }

  public static parseCharacterDetails(locationId: LocationId, characterDetails: string) {
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
      defaultPosition: textToPositionMap[defaultPosition]
    };

    // Add asset key to expression map
    expressions.set(defaultExpression, characterAssetKey(id, defaultExpression));

    // Add asset keys to expression map
    Parser.checkpoint.map.addMapAsset(
      characterAssetKey(id, defaultExpression),
      characterAssetValue(id, defaultExpression)
    );

    // Add character to map
    Parser.checkpoint.map.addItemToMap(GameLocationAttr.characters, id, character);

    // Add character to location
    if (addToLoc) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.characters, id);
    }
  }
}

export function addCharacterExprToMap(charId: string, expression: string) {
  if (charId === 'you' || charId === 'narrator') {
    return;
  }
  const character = Parser.checkpoint.map.getCharacters().get(charId);

  if (!character) {
    throw new Error(`Character ${charId} not in map!`);
  }

  character.expressions.set(expression, characterAssetKey(charId, expression));

  Parser.checkpoint.map.addMapAsset(
    characterAssetKey(charId, expression),
    characterAssetValue(charId, expression)
  );
}
