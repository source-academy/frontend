import { GameSoundType } from '../sound/GameSoundTypes';

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

export type BitmapFontStyle = {
  key: string;
  size: number;
  fill: number;
  align: number;
};

export type GameSprite = {
  assetKey: string;
  assetXPos: number;
  assetYPos: number;
};

export type GameText = {
  text?: string;
  bitmapStyle?: BitmapFontStyle;
  style?: any;
};

export type ItemId = string;
export type AssetKey = string;
export type AssetPath = string;

export type GameButton = GameText & GameSprite & IGameInteractive & TrackInteraction;

export interface IGameInteractive {
  onInteract: () => void;
}

export type TrackInteraction = {
  isInteractive: boolean;
  interactionId: string;
};

export interface IGameUI {
  activateUI: () => Promise<void> | void;
  deactivateUI: () => Promise<void> | void;
}
