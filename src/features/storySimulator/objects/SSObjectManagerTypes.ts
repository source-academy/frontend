import { ItemId, AssetKey, AssetPath } from 'src/features/game/commons/CommonsTypes';
import { IScreenLoggable } from '../logger/SSLogManagerTypes';

export type SSObjectDetail = IScreenLoggable & {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  x: number;
  y: number;
  width?: number;
  height?: number;
};
