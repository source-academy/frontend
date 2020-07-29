import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';

export enum AwardPage {
  Collectibles = 'Collectibles',
  Achievements = 'Achievements'
}

export type AwardProperty = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  title: string;
  description: string;
  completed?: boolean; // optional because collectible doesnt use this
};
