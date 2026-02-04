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
