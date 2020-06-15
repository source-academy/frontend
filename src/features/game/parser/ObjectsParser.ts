
import { splitToLines, mapByHeader, isEnclosedBySquareBrackets, splitByChar } from './ParserHelper';
import { LocationId } from '../location/GameMapTypes';
import Parser from './Parser';
import { GameItemTypeDetails } from '../location/GameMapConstants';
import { Constants } from '../commons/CommonConstants';
import ActionParser from './ActionParser';

function objectAssetKey(shortPath: string) {
  return shortPath;
}

function objectAssetValue(shortPath: string) {
  const [texture, skin] = shortPath.split('/');
  return `${Constants.assetsFolder}/objects/${texture}/${skin || 'normal'}.png`;
}

export default function ObjectParser(fileName: string, fileContent: string) {
  const lines: string[] = splitToLines(fileContent);
  const locationRawObjectsMap: Map<LocationId, string[]> = mapByHeader(
    lines,
    isEnclosedBySquareBrackets
  );

  locationRawObjectsMap.forEach(addObjectListToLoc);
}

function addObjectListToLoc(objectsList: string[], locationId: LocationId): void {
  const separatorIndex = objectsList.findIndex(object => object === '$');
  const objectDetails = objectsList.slice(0, separatorIndex);

  // Parse basic object
  objectDetails.forEach(objectDetail => {
    const toAddToMap = objectDetail && objectDetail[0] === '+';
    if (toAddToMap) {
      objectDetail = objectDetail.slice(1);
    }

    const [objectId, shortPath, x, y] = splitByChar(objectDetail, ',');

    const object = {
      assetKey: objectAssetKey(shortPath),
      x: parseInt(x),
      y: parseInt(y),
      isInteractive: false,
      interactionId: objectId
    };

    Parser.chapter.map.addItemToMap(GameItemTypeDetails.Object, objectId, object);

    Parser.chapter.map.addMapAsset(objectAssetKey(shortPath), objectAssetValue(shortPath));

    if (toAddToMap) {
      Parser.chapter.map.setItemAt(locationId, GameItemTypeDetails.Object, objectId);
    }
  });

  // Parse actions
  if (separatorIndex !== -1) {
    const objectActions = objectsList.slice(separatorIndex + 1, objectsList.length - 1);

    objectActions.forEach(objectDetail => {
      const [objectId, ...actions] = objectDetail.split(', ');

      const objectProperty = Parser.chapter.map.getObjects().get(objectId);
      if (objectProperty) {
        objectProperty.actions = ActionParser(actions);
      }
    });
  }
}
