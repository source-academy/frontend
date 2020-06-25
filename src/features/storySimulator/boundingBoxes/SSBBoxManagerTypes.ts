import { ItemId } from 'src/features/game/commons/CommonsTypes';
import { IScreenLoggable } from '../logger/SSLogManagerTypes';

export type SSBBoxDetail = IScreenLoggable & {
  id: ItemId;
  x: number;
  y: number;
  width: number;
  height: number;
};
