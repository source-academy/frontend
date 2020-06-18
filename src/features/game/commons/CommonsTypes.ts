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

export type GameSprite = {
  assetKey: string;
  assetXPos: number;
  assetYPos: number;
};

export type GameText = {
  text?: string;
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
  fetchLatestState: () => void;
  getUIContainer: () => Phaser.GameObjects.Container;
  activateUI: () => Promise<void>;
  deactivateUI: () => Promise<void>;
}
