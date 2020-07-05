import { TrackInteraction } from '../commons/CommonsTypes';
import { IGameActionable } from '../action/GameActionTypes';
import GlowingImage from '../effects/GlowingObject';

export type ObjectProperty = TrackInteraction &
  IGameActionable & {
    assetKey: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

export type ObjectLayerProps = {
  cursor?: string;
};

export type ActivatableObject = {
  sprite: GlowingImage;
  activate: Function;
  deactivate: Function;
};
