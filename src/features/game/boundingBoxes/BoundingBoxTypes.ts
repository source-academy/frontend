type ObjectId = string;

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type ObjectProperty = {
  x: number;
  y: number;
  width: number;
  height: number;
  actions: ObjectAction[];
  visibility?: true;
};

export type ObjectPropertyMap = Map<ObjectId, ObjectProperty>;

export type SpriteMap = Map<ObjectId, Phaser.GameObjects.Image>;
