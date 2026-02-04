import { IGameActionable } from '../action/GameActionTypes';
import { AssetKey, ItemId, TrackInteraction } from '../commons/CommonTypes';
import GlowingImage from '../effects/GlowingObject';

/**
 * Encapsulates data about an object in a location.
 * @prop {boolean} isInteractive - whether or not this object is clickable
 * @prop {ItemId} interactionId - the object id that identifies the object so we can keep track of its interactions
 * @prop {ItemId[]} actionIds - ids of all actions that play when this object is clicked
 * @prop {AssetKey} assetKey - the asset key for the image rendered to represent this object
 * @prop {number} x - x coordinate of center of the object
 * @prop {number} y - y coordinate of center of the object
 * @prop {number} width - display width of the object if not its original size
 * @prop {number} height - display height of the object if not its original size
 */
export type ObjectProperty = TrackInteraction &
  IGameActionable & {
    assetKey: AssetKey;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

export type ObjectLayerProps = {
  cursor?: string;
};

/**
 * Data that represents the object on screen.
 * @prop {GlowingImage| Phaser.GameObjects.Rectangle} sprite - The clickable object sprite which can be made to glow and blink
 * @prop {Phaser.GameObjects.Image| Phaser.GameObjects.Rectangle} sprite - The area which can be clicked
 * @prop {ItemId[]} actionIds - The action ids
 * @prop {ItemId} interactionId - The interaction id for the sprite
 */
export type ActivatableSprite = {
  sprite: GlowingImage | Phaser.GameObjects.Rectangle;
  clickArea: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  actionIds?: ItemId[];
  interactionId: ItemId;
};
