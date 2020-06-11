import { ObjectId } from '../commons/CommonsTypes';

type ObjectTexture = string;
type XCoord = number;
type YCoord = number;
type ObjectDetail = [ObjectTexture, XCoord, YCoord];

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type ObjectProperty = {
  details: ObjectDetail;
  actions: ObjectAction[];
  visibility?: true;
};

export type ObjectPropertyMap = Map<ObjectId, ObjectProperty>;

export type SpriteMap = Map<ObjectId, Phaser.GameObjects.Image>;
