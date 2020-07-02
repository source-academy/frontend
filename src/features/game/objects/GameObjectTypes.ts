import { TrackInteraction } from '../commons/CommonsTypes';
import { IGameActionable } from '../action/GameActionTypes';
import { BlinkingObject } from '../effects/BlinkingObject';

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
  blinkingObject: BlinkingObject;
  activate: Function;
  deactivate: Function;
};
