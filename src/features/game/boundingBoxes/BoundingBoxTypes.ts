import { ItemId } from '../commons/CommonsTypes';

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type BBoxProperty = {
  x: number;
  y: number;
  width: number;
  height: number;
  interactionId: string;
};

export type BBoxPropertyMap = Map<ItemId, BBoxProperty>;
export const emptyBBoxPropertyMap = new Map<ItemId, BBoxProperty>();
