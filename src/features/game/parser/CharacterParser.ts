import { splitToLines, isEnclosedBySquareBrackets, mapByHeader, splitByChar } from './ParserHelper';
import { LocationId } from '../location/GameMapTypes';
import Parser from './Parser';
import { Character } from '../character/GameCharacterTypes';
import { characterPositionMap } from './DialogueParser';
import { GameItemTypeDetails } from '../location/GameMapConstants';
import { AssetKey, ItemId } from '../commons/CommonsTypes';
import { Constants } from '../commons/CommonConstants';

export default function CharacterParser(fileName: string, fileContent: string): void {
  const lines: string[] = splitToLines(fileContent);
  const locToCharMap: Map<LocationId, string[]> = mapByHeader(lines, isEnclosedBySquareBrackets);
  locToCharMap.forEach((characters, locationId) =>
    characters.forEach(characterString => addCharacterToLoc(characterString, locationId))
  );
}

export function characterAssetKey(characterId: ItemId, expression: string) {
  return characterId + expression;
}

export function characterAssetValue(characterId: ItemId, expression: string) {
  return `${Constants.assetsFolder}/avatars/${characterId}/${characterId}.${expression}.png`;
}

function addCharacterToLoc(rawCharacterStr: string, locationId: LocationId): void {
  let addCharacterToMap = false;
  if (rawCharacterStr[0] === '+') {
    addCharacterToMap = true;
    rawCharacterStr = rawCharacterStr.slice(1);
  }

  const [id, name, defaultExpression, defaultPosition] = splitByChar(rawCharacterStr, ',');

  const expressions = new Map<string, AssetKey>();

  const character: Character = {
    id,
    name,
    expressions,
    defaultExpression,
    defaultPosition: characterPositionMap[defaultPosition]
  };

  // Add asset key to expression map
  expressions.set(defaultExpression, characterAssetKey(id, defaultExpression));

  // Add asset keys to expression map
  Parser.chapter.map.addMapAsset(
    characterAssetKey(id, defaultExpression),
    characterAssetValue(id, defaultExpression)
  );

  // Add character to map
  Parser.chapter.map.addItemToMap(GameItemTypeDetails.Character, id, character);

  // Add character to location
  if (addCharacterToMap) {
    Parser.chapter.map.setItemAt(locationId, GameItemTypeDetails.Character, id);
  }
}

export function addCharacterExprToMap(charId: string, expression: string) {
  if (charId === 'you' || charId === 'narrator') {
    return;
  }
  const character = Parser.chapter.map.getCharacters().get(charId);

  if (!character) {
    throw new Error(`Character ${charId} not in map!`);
  }

  character.expressions.set(expression, characterAssetKey(charId, expression));

  Parser.chapter.map.addMapAsset(
    characterAssetKey(charId, expression),
    characterAssetValue(charId, expression)
  );
}
