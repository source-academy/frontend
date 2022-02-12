import React, { RefObject } from 'react';

import { Visible } from '../EnvVisualizerTypes';

/** this class encapsulates a level of frames to be drawn with the same y values */
export abstract class Level implements Visible {
  ref: RefObject<any> = React.createRef();
  constructor(
    /** the level of this */
    readonly parentLevel: Level | null
  ) {}
  abstract x(): number;
  abstract y(): number;
  abstract height(): number;
  abstract width(): number;

  abstract setY(y: number): any;

  abstract draw(): React.ReactNode;
}
