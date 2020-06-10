import { LocationObjectsMap, ObjectProperty, ObjectAction } from './ObjectsTypes';

type Container = Phaser.GameObjects.Container;
const { Container, Image } = Phaser.GameObjects;

export function createObjectsLayer(
  scene: Phaser.Scene,
  currLocation: string,
  locationObjectsMap: string
): LocationObjectsMap {
  const objectPropertyMap = locationObjectsMap[currLocation];
  const objectRenderMap = {};

  const container = new Container(scene, 0, 0);

  _.forOwn(objectPropertyMap, renderObject);
  return {};
}

function renderObject(objectProperty: ObjectProperty, objectId: string) {
  const { details, actions } = objectProperty;
  const [texture, xCoord, yCoord] = details;
  const objectSprite = new Image(scene, xCoord, yCoord, texture);
  container.add(objectSprite);

  objectRenderMap[objectId]['sprite'] = objectSprite;
  objectSprite.on('pointerdown', onClick(actions));
}

function onClick(actions: ObjectAction[]) {
  return () => console.log(actions);
}
