import { ItemId, AssetKey, AssetPath } from 'src/features/game/commons/CommonsTypes';

export type SSObjectDetail = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  x: number;
  y: number;
  width?: number;
  height?: number;
};
