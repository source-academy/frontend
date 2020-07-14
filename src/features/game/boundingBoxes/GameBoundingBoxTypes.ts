import { IGameActionable } from '../action/GameActionTypes';
import { TrackInteraction } from '../commons/CommonTypes';

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
