import { splitToLines, mapByHeader } from './ParserHelper';
import { mapValues } from '../utils/GameUtils';
import { ObjectProperty } from '../objects/GameObjectTypes';
import { ItemId } from '../commons/CommonsTypes';
import { GameChapter } from '../chapter/GameChapterTypes';

export default function ObjectParser(chapter: GameChapter, fileName: string, fileContent: string) {
  const lines = splitToLines(fileContent);
  const locationRawObjectsMap = mapByHeader(lines, (str: string) => true);
  const objectsMap = mapValues(locationRawObjectsMap, objPropertyMapper);
  return objectsMap;
}

function objPropertyMapper(objectsList: string[]): Map<ItemId, ObjectProperty> {
  const separatorIndex = objectsList.findIndex(object => object === '$');
  const objectDetails = objectsList.slice(0, separatorIndex);

  const objectPropertyMap = new Map<ItemId, ObjectProperty>();
  objectDetails.forEach(objectDetail => {
    const [objectId, assetKey, x, y] = objectDetail.split(', ');
    objectPropertyMap.set(objectId, {
      assetKey,
      x: parseInt(x),
      y: parseInt(y),
      isInteractive: false,
      interactionId: objectId
    });
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

// function loadObjectsAssetsFromText(scene: Phaser.Scene, text: string) {
//   const locationObjectsMap = mapObjectsByLocation(text);
//   locationObjectsMap.forEach(objectList => {
//     for (const objectDetail of objectList) {
//       if (objectDetail === '$') break;

//       const [, texture] = objectDetail.split(', ');
//       loadObject(scene, texture);
//     }
//   });
// }

// const loadObject = (scene: Phaser.Scene, imagePath: string) => {
//   const [texture, skin] = imagePath.split('/');
//   const fullObjectPath = `${Constants.assetsFolder}/objects/${texture}/${skin || 'normal'}.png`;
//   scene.load.image(imagePath, fullObjectPath);
// };
