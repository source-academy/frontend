import { ItemId } from 'src/features/game/commons/CommonsTypes';
export type ShortPath = string;

export type ObjectDetail = {
  id: ItemId;
  assetKey: string;
  assetPath: string;
  x: number;
  y: number;
};
