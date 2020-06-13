import { ObjectProperty } from '../objects/ObjectsTypes';
import { Dialogue } from '../dialogue/DialogueTypes';
import { BBoxProperty } from '../boundingBoxes/BoundingBoxTypes';

export type ImageAsset = {
  key: string;
  path: string;
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

export type GameMapItem = Dialogue | ObjectProperty | BBoxProperty;
export type ItemId = DialogueId | ObjectId | BBoxId;
export const emptyGameItemMap = new Map<string, GameMapItem>();

export type GameButton = GameText & GameSprite & IGameInteractive;

export interface IGameInteractive {
  isInteractive: boolean;
  onInteract: () => void;
}

export interface IGameUI {
  fetchLatestState: () => void;
  getUIContainer: () => Phaser.GameObjects.Container;
  activateUI: () => Promise<void>;
  deactivateUI: () => Promise<void>;
}

export type ObjectId = string;
export type DialogueId = string;
export type LocationId = string;
export type BBoxId = string;
