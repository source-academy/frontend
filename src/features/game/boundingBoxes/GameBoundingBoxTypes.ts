import { TrackInteraction } from '../commons/CommonsTypes';
import { IGameActionable } from '../action/GameActionTypes';

export type BBoxProperty = TrackInteraction &
  IGameActionable & {
    x: number;
    y: number;
    width: number;
    height: number;
  };

export type ActivatableBBox = {
  sprite: Phaser.GameObjects.Rectangle;
  activate: Function;
  deactivate: Function;
};
