export const screenSize = {
  x: 1920,
  y: 1080
};

export type GameImage = {
  key: string;
  path: string;
  xPos: number;
  yPos: number;
  imageWidth: number;
  imageHeight: number;
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

export type GameButton = GameText & GameSprite;

export interface IGameInteractive {
  isInteractive: boolean;
  onInteract: () => void;
}

export interface IGameUI {
  renderUI: (scene: Phaser.Scene) => void;
}
