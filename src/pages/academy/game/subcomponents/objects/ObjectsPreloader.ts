import { mapObjectsByLocation } from './ObjectsManager';
import { Constants as c } from '../utils/constants';

export async function preloadObjects(scene: Phaser.Scene, url: string) {
  scene.load.text(`#O${url}`, url);
}

export function loadObjectsAssets(scene: Phaser.Scene, key: string) {
  const text = scene.cache.text.get(key);
  const locationObjectsMap = mapObjectsByLocation(text);
  Object.values(locationObjectsMap).forEach(objectList => {
    for (const objectDetail of objectList) {
      if (objectDetail === c.objectActionSeparator) break;

      const [, texture] = objectDetail.split(', ');
      loadObject(scene, texture);
    }
  });
}

const loadObject = (scene: Phaser.Scene, imagePath: string) => {
  const [texture, skin] = imagePath.split('/');
  const fullObjectPath = `${c.assetsFolder}/objects/${texture}/${skin || 'normal'}.png`;
  console.log(fullObjectPath);
  scene.load.image(imagePath, fullObjectPath);
};
