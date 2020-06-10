import * as _ from 'lodash';

import { splitToLines, mapByHeader } from '../utils/stringUtils';
import { isLabel } from './ObjectsHelper';
import { LocationObjectsMap, LocationRawObjectsMap, ObjectPropertyMap } from './ObjectsTypes';
import { Constants as c } from '../utils/constants';

export function parseObjects(text: string): LocationObjectsMap {
  const locationRawObjectsMap = mapObjectsByLocation(text);
  const objectsMap = _.mapValues(locationRawObjectsMap, objPropertyMapper);
  return objectsMap;
}

export function mapObjectsByLocation(text: string): LocationRawObjectsMap {
  const lines = splitToLines(text);
  const locationRawObjectsMap = mapByHeader(lines, isLabel);
  return locationRawObjectsMap;
}

function objPropertyMapper(objectsList: string[]): ObjectPropertyMap {
  const separatorIndex = objectsList.findIndex(object => object === c.objectActionSeparator);

  const objectPropertyMap = {};
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
