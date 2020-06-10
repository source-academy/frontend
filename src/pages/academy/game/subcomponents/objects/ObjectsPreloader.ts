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

      const [objectId, texture] = objectDetail.split(', ');
      loadObject(scene, objectId, texture);
    }
  });
}

const loadObject = (scene: Phaser.Scene, objectId: string, imagePath: string) => {
  scene.load.image(objectId, imagePath);
};
