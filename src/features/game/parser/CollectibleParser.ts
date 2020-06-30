import { splitToLines, isEnclosedBySquareBrackets, mapByHeader, splitByChar } from './ParserHelper';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import { Constants } from '../commons/CommonConstants';
import { CollectibleProperty } from '../collectibles/GameCollectiblesTypes';

export default function CollectibleParser(fileName: string, fileContent: string): void {
  const lines: string[] = splitToLines(fileContent);
  const locToCharMap: Map<LocationId, string[]> = mapByHeader(lines, isEnclosedBySquareBrackets);
  locToCharMap.forEach((collectibleString, locationId) =>
    collectibleString.forEach(collectibleString =>
      addCollectibleToLoc(collectibleString, locationId)
    )
  );
}

function collectibleAssetKey(shortPath: string) {
  return shortPath;
}

function collectibleAssetValue(shortPath: string) {
  const [folder, texture] = shortPath.split('/');
  return `${Constants.assetsFolder}/${folder}/${texture}.png`;
}

function addCollectibleToLoc(rawCollectibleString: string, locationId: LocationId): void {
  let addCollectibleToMap = false;
  if (rawCollectibleString[0] === '+') {
    addCollectibleToMap = true;
    rawCollectibleString = rawCollectibleString.slice(1);
  }

  const [id, shortPath, x, y, width, height] = splitByChar(rawCollectibleString, ',');

  const collectible: CollectibleProperty = {
    assetKey: collectibleAssetKey(shortPath),
    x: parseInt(x),
    y: parseInt(y),
    width: parseInt(width) || undefined,
    height: parseInt(height) || undefined
  };

  // Add collectible to assets
  Parser.checkpoint.map.addMapAsset(
    collectibleAssetKey(shortPath),
    collectibleAssetValue(shortPath)
  );

  // Add collectible to map asset
  Parser.checkpoint.map.addItemToMap(GameLocationAttr.collectibles, id, collectible);

  // Add collectible to map
  if (addCollectibleToMap) {
    Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.collectibles, id);
  }
}
