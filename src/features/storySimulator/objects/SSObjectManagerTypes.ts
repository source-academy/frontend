import { AssetKey, AssetPath, ItemId } from 'src/features/game/commons/CommonTypes';

export type SSObjectDetail = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  x: number;
  y: number;
  width?: number;
  height?: number;
};
