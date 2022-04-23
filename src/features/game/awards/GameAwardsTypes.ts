import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';

export type AwardProperty = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  title: string;
  description: string;
  completed: boolean;
};
