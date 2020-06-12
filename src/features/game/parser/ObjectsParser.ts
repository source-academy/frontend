import { splitToLines, mapByHeader } from './StringUtils';
import { isLabel } from '../objects/ObjectsHelper';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { mapValues } from '../utils/GameUtils';
import { ObjectId, LocationId } from '../commons/CommonsTypes';

type LocationRawObjectsMap = Map<string, string[]>;

export function parseObjects(text: string): Map<LocationId, Map<ObjectId, ObjectProperty>> {
  const locationRawObjectsMap = mapObjectsByLocation(text);
  const objectsMap = mapValues(locationRawObjectsMap, objPropertyMapper);
  return objectsMap;
}

export function mapObjectsByLocation(text: string): LocationRawObjectsMap {
  const lines = splitToLines(text);
  const locationRawObjectsMap = mapByHeader(lines, isLabel);
  return locationRawObjectsMap;
}

function objPropertyMapper(objectsList: string[]): Map<ObjectId, ObjectProperty> {
  const separatorIndex = objectsList.findIndex(object => object === '$');
  const objectDetails = objectsList.slice(0, separatorIndex);

  const objectPropertyMap = new Map<ObjectId, ObjectProperty>();
  objectDetails.forEach(objectDetail => {
    const [objectId, texture, x, y] = objectDetail.split(', ');
    objectPropertyMap.set(objectId, { texture, x: parseInt(x), y: parseInt(y) });
  });

  if (separatorIndex !== -1) {
    const objectActions = objectsList.slice(separatorIndex + 1, objectsList.length - 1);

    objectActions.forEach(objectDetail => {
      const [objectId, ...actions] = objectDetail.split(', ');
      const objectProperty = objectPropertyMap.get(objectId);
      objectProperty && (objectProperty.actions = actions);
    });
  }

  return objectPropertyMap;
}
