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

export type GameButton = GameText & GameSprite & IGameInteractive;

export interface IGameInteractive {
  isInteractive: boolean;
  onInteract: () => void;
}

export interface IGameUI {
  getUIContainer: () => Phaser.GameObjects.Container;
  activateUI: (container: Phaser.GameObjects.Container) => Promise<void>;
  deactivateUI: (container: Phaser.GameObjects.Container) => Promise<void>;
}

export const shortButton: GameImage = {
  key: 'short-button',
  path: '../assets/shortButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const longButton: GameImage = {
  key: 'long-button',
  path: '../assets/longButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const blackScreen: GameImage = {
  key: 'black-screen',
  path: '../assets/blackScreen.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const topButton: GameImage = {
  key: 'top-button',
  path: '../assets/topButton.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};
