import * as _ from 'lodash';
import { ObjectProperty, ObjectAction, ObjectPropertyMap, SpriteMap } from './ObjectsTypes';
import { mapValues } from '../utils/GameUtils';

type Container = Phaser.GameObjects.Container;
const { Image, Container } = Phaser.GameObjects;

export function createObjectsLayer(
  scene: Phaser.Scene,
  objectPropertyMap: ObjectPropertyMap
): [SpriteMap, Container] {
  const container = new Container(scene, 0, 0);

  const objectSpriteMap = mapValues(objectPropertyMap, createInteractiveObject(scene));
  container.add(Array.from(objectSpriteMap.values()));

  return [objectSpriteMap, container];
}

const createInteractiveObject = (scene: Phaser.Scene) => (objectProperty: ObjectProperty) => {
  const { details, actions } = objectProperty;
  const [texture, xCoord, yCoord] = details;
  const objectSprite = new Image(scene, xCoord, yCoord, texture).setInteractive({
    useHandCursor: true,
    pixelPerfect: true
  });

  objectSprite.on('pointerdown', onClick(actions));
  return objectSprite;
};

function onClick(actions: ObjectAction[]) {
  return () => console.log(actions);
}
