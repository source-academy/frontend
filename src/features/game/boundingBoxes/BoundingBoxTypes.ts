import { BBoxId } from '../commons/CommonsTypes';

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type BBoxProperty = {
  x: number;
  y: number;
  width: number;
  height: number;
  actions: ObjectAction[];
  visibility?: true;
};

export type BBoxPropertyMap = Map<BBoxId, BBoxProperty>;
