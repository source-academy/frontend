import GameInputManager from '../input/GameInputManager';
import GameLayerManager from '../layer/GameLayerManager';
import GamePhaseManager from '../phase/GamePhaseManager';

/**
 * Encapsulate style of bitmap text.
 *
 * @prop {string} key - key to the bitmap text
 * @prop {number} size - font size
 * @prop {number} fill = text color, in hex
 * @prop {number} align - text alignment, from Phaser.GameObjects.BitmapText.ALIGN_*
 */
export type BitmapFontStyle = {
  key: string;
  size: number;
  align: number;
};

/**
 * ID associated with an item.
 * Item can be any of the following:
 * (Dialogue | ObjectProperty | BboxProperty | Character | Action | AwardProperty)
 */
export type ItemId = string;

/** Key associated with an asset */
export type AssetKey = string;

/** Path associated with an asset */
export type AssetPath = string;

/**
 * Encapsulate tracked interaction.
 *
 * @prop {boolean} isInteractive whether an object is interactive
 * @prop {string} interactionId id of interaction. Must be unique across all interactions.
 */
export type TrackInteraction = {
  isInteractive: boolean;
  interactionId: string;
};

/**
 * Interface for classes that represents a UI.
 * The UI must be able to be activated and deactivated.
 *
 * @interface
 */
export interface IGameUI {
  activateUI: () => Promise<void> | void;
  deactivateUI: () => Promise<void> | void;
}

/**
 * Enum for common game positions.
 * @readonly
 * @enum {string}
 */
export enum GamePosition {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right'
}

/**
 * Enum for common game size.
 * @readonly
 * @enum {string}
 */
export enum GameSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large'
}

/**
 * Encapsulate text configuration.
 *
 * @prop {number} x x coordinate of the text
 * @prop {number} y y coordinate of the text
 * @prop {number} oriX originX of the text
 * @prop {number} oriY originY of the text
 */
export type TextConfig = { x: number; y: number; oriX: number; oriY: number };

/**
 * Interface for basic scene, which incorporates input, phaser, and layer manager.
 * Due to the three managers, the scene should also provide a way to clean up
 * the necessary managers.
 *
 * @interface
 */
export interface IBaseScene extends Phaser.Scene {
  getLayerManager: () => GameLayerManager;
  getInputManager: () => GameInputManager;
  getPhaseManager: () => GamePhaseManager;
  cleanUp: () => void;
}

/**
 * Interface for scene which possess a layer manager.
 *
 * @interface
 */
export interface ILayeredScene extends Phaser.Scene {
  getLayerManager: () => GameLayerManager;
}
