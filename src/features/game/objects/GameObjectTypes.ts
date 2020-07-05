import { TrackInteraction } from '../commons/CommonsTypes';
import { IGameActionable } from '../action/GameActionTypes';
import GlowingImage from '../effects/GlowingObject';

type ActionName = string;
type ActionParams = Array<any>;
export type ObjectAction = [ActionName, ActionParams];

export type ObjectProperty = TrackInteraction &
  IGameActionable & {
    assetKey: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    visibility?: true;
  };

export type ObjectLayerProps = {
  cursor?: string;
};

export type ActivatableObject = {
  sprite: GlowingImage;
  activate: Function;
  deactivate: Function;
};
