export type ImageAsset = {
  key: string;
  path: string;
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

export type GameButton = GameText & GameSprite & IGameInteractive;

export interface IGameInteractive {
  isInteractive: boolean;
  onInteract: () => void;
  interactionId?: string;
}

export interface IGameUI {
  fetchLatestState: () => void;
  getUIContainer: () => Phaser.GameObjects.Container;
  activateUI: () => Promise<void>;
  deactivateUI: () => Promise<void>;
}
