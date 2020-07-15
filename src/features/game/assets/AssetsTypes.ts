import { AssetKey, AssetPath, ItemId } from '../commons/CommonTypes';
import { GameSoundType } from '../sound/GameSoundTypes';

export type ImageAssetMap = {
  [name: string]: ImageAsset;
};

export type TextAssetMap = {
  [name: string]: TextAsset;
};

export type AssetMap<T> = {
  [name: string]: T;
};

export type ImageAsset = {
  key: string;
  path: string;
};

export type SoundAsset = {
  key: string;
  path: string;
  config: Phaser.Types.Sound.SoundConfig;
  soundType: GameSoundType;
};

export type FontAsset = {
  key: string;
  pngPath: string;
  fntPath: string;
};

export type TextAsset = {
  key: string;
  path: string;
};

export type AssetObject = {
  assetsMap: Map<AssetKey, AssetPath>;
  collectibles: Map<ItemId, AssetKey>;
  achievements: Map<ItemId, AssetKey>;
};
