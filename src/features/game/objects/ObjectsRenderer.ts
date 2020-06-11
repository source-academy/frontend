import { ObjectProperty, ObjectLayerProps } from './ObjectsTypes';
import { mapValues } from '../utils/GameUtils';
import { ObjectId } from '../commons/CommonsTypes';

type Container = Phaser.GameObjects.Container;
type Image = Phaser.GameObjects.Image;
const { Image, Container } = Phaser.GameObjects;

export function createObjectsLayer(
  scene: Phaser.Scene,
  objectPropertyMap: Map<ObjectId, ObjectProperty>,
  props?: ObjectLayerProps
): [Map<ObjectId, Image>, Container] {
  const container = new Container(scene, 0, 0);

  const objectSpriteMap = mapValues(objectPropertyMap, objectProperty =>
    createInteractiveObject(scene, objectProperty, props || {})
  );
  container.add(Array.from(objectSpriteMap.values()));

  return [objectSpriteMap, container];
}

function createInteractiveObject(
  scene: Phaser.Scene,
  objectProperty: ObjectProperty,
  { cursor }: ObjectLayerProps
): Image {
  const { texture, x, y, actions } = objectProperty;
  const objectSprite = new Image(scene, x, y, texture).setInteractive({
    cursor,
    pixelPerfect: true
  });

  objectSprite.on('pointerdown', onClick(actions || []));
  return objectSprite;
}

function onClick(actions: string[]) {
  return () => console.log(actions);
}
