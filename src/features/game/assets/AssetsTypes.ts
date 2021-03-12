import { AssetKey, AssetPath } from '../commons/CommonTypes';
import { GameSoundType } from '../sound/GameSoundTypes';

export type AssetMap<T> = {
  [name: string]: T;
};

export type ImageAsset = {
  type: AssetType;
  key: AssetKey;
  path: AssetPath;
  config?: ImageConfig;
};

export enum AssetType {
  Image = 'Image',
  Sprite = 'Sprite'
}

export type ImageConfig = {
  frameWidth: number;
  frameHeight: number;
  centreX: number;
  centreY: number;
  endFrame?: number;
  start?: number;
  frameRate?: number;
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
