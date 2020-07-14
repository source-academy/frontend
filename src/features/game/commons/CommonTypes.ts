import GameInputManager from '../input/GameInputManager';
import GameLayerManager from '../layer/GameLayerManager';
import GameSoundManager from '../sound/GameSoundManager';

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

export type ItemId = string;
export type AssetKey = string;
export type AssetPath = string;

export type TrackInteraction = {
  isInteractive: boolean;
  interactionId: string;
};

export interface IGameUI {
  activateUI: () => Promise<void> | void;
  deactivateUI: () => Promise<void> | void;
}

export enum GamePosition {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right'
}

export type TextConfig = { x: number; y: number; oriX: number; oriY: number };

export interface IBaseScene extends Phaser.Scene {
  soundManager: GameSoundManager;
  layerManager: GameLayerManager;
  inputManager: GameInputManager;
  cleanUp: () => void;
}
