import { TrackInteraction } from '../commons/CommonsTypes';

export type BBoxProperty = TrackInteraction & {
  x: number;
  y: number;
  width: number;
  height: number;
};
