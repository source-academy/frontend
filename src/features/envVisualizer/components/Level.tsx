// import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';

import { Visible } from '../EnvVisualizerTypes';

/** this class encapsulates a level of frames to be drawn with the same y values */
export abstract class Level implements Visible {
  abstract x: number;
  y: number = 0;
  height: number = 0;
  abstract width: number;
  ref: RefObject<any> = React.createRef();
  constructor(
    /** the level of this */
    readonly parentLevel: Level | null
  ) {}

  abstract setY(y: number): any;

  abstract draw(): React.ReactNode;
}
