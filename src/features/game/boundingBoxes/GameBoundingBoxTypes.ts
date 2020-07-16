import { IGameActionable } from '../action/GameActionTypes';
import { TrackInteraction } from '../commons/CommonTypes';

/**
 * Information on a bounding box, a clickable rectangle area
 *
 * @prop {number} x - x coordinate of center of bounding box
 * @prop {number} y - y coordinate of center of bounding box
 * @prop {number} width - width of bounding box
 * @prop {number} height - height of bounding box
 */
export type BBoxProperty = TrackInteraction &
  IGameActionable & {
    x: number;
    y: number;
    width: number;
    height: number;
  };

/**
 * Bounding box as a Phaser Game object that can be activated
 * using activate and deactivate during Explore mode
 *
 * @prop {Phaser.GameObjects.Rectangle} sprite - the clickable rectangle representing the bounding box
 * @prop {Function} activate - the function to activate the bbox and enable listeners
 *                             this may be called with additional onUp, onHover and onOut parameters.
 * @prop {Function} deactivate - the function to deactivate the bbox and disable all listeners
 */
export type ActivatableBBox = {
  sprite: Phaser.GameObjects.Rectangle;
  activate: Function;
  deactivate: Function;
};
