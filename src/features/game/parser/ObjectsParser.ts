import { splitToLines, mapByHeader } from './StringUtils';
import { isLabel } from '../objects/ObjectsHelper';
import { ObjectProperty } from '../objects/ObjectsTypes';
import { mapValues } from '../utils/GameUtils';
import { ItemId } from '../commons/CommonsTypes';

export default function ObjectParser(text: string) {
  const lines = splitToLines(text);
  const locationRawObjectsMap = mapByHeader(lines, isLabel);
  const objectsMap = mapValues(locationRawObjectsMap, objPropertyMapper);
  return objectsMap;
}

function objPropertyMapper(objectsList: string[]): Map<ItemId, ObjectProperty> {
  const separatorIndex = objectsList.findIndex(object => object === '$');
  const objectDetails = objectsList.slice(0, separatorIndex);

  const objectPropertyMap = new Map<ItemId, ObjectProperty>();
  objectDetails.forEach(objectDetail => {
    const [objectId, assetKey, x, y] = objectDetail.split(', ');
    objectPropertyMap.set(objectId, { assetKey, x: parseInt(x), y: parseInt(y) });
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

function loadObjectsAssetsFromText(scene: Phaser.Scene, text: string) {
  const locationObjectsMap = mapObjectsByLocation(text);
  locationObjectsMap.forEach(objectList => {
    for (const objectDetail of objectList) {
      if (objectDetail === '$') break;

      const [, texture] = objectDetail.split(', ');
      loadObject(scene, texture);
    }
  });
}

const loadObject = (scene: Phaser.Scene, imagePath: string) => {
  const [texture, skin] = imagePath.split('/');
  const fullObjectPath = `${Constants.assetsFolder}/objects/${texture}/${skin || 'normal'}.png`;
  scene.load.image(imagePath, fullObjectPath);
};
