import { AssetKey, AssetPath, ItemId } from 'src/features/game/commons/CommonTypes';

export type AwardProperty = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  title: string;
  description: string;
  completed: boolean;
};
