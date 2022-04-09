import React from 'react';

import { Visible } from './Visible';

/** this class encapsulates a level of frames to be drawn with the same y values */
export abstract class Level extends Visible {
  protected constructor(
    /** the level of this */
    readonly parentLevel: Level | null
  ) {
    super();
  }

  abstract setY(y: number): any;

  abstract draw(): React.ReactNode;
}
