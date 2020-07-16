import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';
import { UserStateTypes } from '../state/GameStateTypes';

export type AwardProperty = {
  id: ItemId;
  assetKey: AssetKey;
  assetPath: AssetPath;
  title: string;
  description: string;
  awardType: UserStateTypes;
};
