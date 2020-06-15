import { ItemId, TrackInteraction } from '../commons/CommonsTypes';

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type BBoxProperty = TrackInteraction & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BBoxPropertyMap = Map<ItemId, BBoxProperty>;
export const emptyBBoxPropertyMap = new Map<ItemId, BBoxProperty>();
