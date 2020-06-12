import { mapObjectsByLocation } from './ObjectsParser';
import { Constants } from '../commons/CommonConstants';

export function loadObjectsAssetsFromText(scene: Phaser.Scene, text: string) {
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
