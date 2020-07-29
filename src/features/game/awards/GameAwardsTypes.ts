import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';

export enum AwardPage {
  Collectibles = 'Collectibles',
  Achievements = 'Achievements'
}

export type CollectibleProperty = {
  assetKey: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type AwardProperty = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  title: string;
  description: string;
  completed?: boolean;
};
