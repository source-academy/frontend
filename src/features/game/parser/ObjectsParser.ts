import * as _ from 'lodash';

import { splitToLines, mapByHeader } from './StringUtils';
import { isLabel } from '../objects/ObjectsHelper';
import { ObjectPropertyMap, ObjectProperty } from '../objects/ObjectsTypes';
import { Constants as c } from '../commons/CommonConstants';
import { mapValues } from '../utils/GameUtils';

type LocationRawObjectsMap = Map<string, string[]>;

export function parseObjects(text: string) {
  const locationRawObjectsMap = mapObjectsByLocation(text);
  const objectsMap = mapValues(locationRawObjectsMap, objPropertyMapper);
  return objectsMap;
}

export function mapObjectsByLocation(text: string): LocationRawObjectsMap {
  const lines = splitToLines(text);
  const locationRawObjectsMap = mapByHeader(lines, isLabel);
  return locationRawObjectsMap;
}

function objPropertyMapper(objectsList: string[]): ObjectPropertyMap {
  const separatorIndex = objectsList.findIndex(object => object === c.objectActionSeparator);
  const objectPropertyMap = new Map<string, ObjectProperty>();
  const objectDetails = objectsList.slice(0, separatorIndex);

  objectDetails.forEach(objectDetail => {
    const [objectId, texture, xCoord, yCoord] = objectDetail.split(', ');
    _.set(objectPropertyMap, [objectId, 'details'], [texture, parseInt(xCoord), parseInt(yCoord)]);
  });

  if (separatorIndex !== -1) {
    const objectActions = objectsList.slice(separatorIndex + 1, objectsList.length - 1);

    objectActions.forEach(objectDetail => {
      const [objectId, ...actions] = objectDetail.split(', ');
      _.set(objectPropertyMap, [objectId, 'actions'], actions);
    });
  }

  return objectPropertyMap;
}
