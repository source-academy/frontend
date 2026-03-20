import React from 'react';

import { Visible } from '../Visible';

/** Invisible anchor box representing a function description label. */
export class FnBodyTarget extends Visible {
  constructor(x: number, y: number, width: number, height: number) {
    super();
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  draw(): React.ReactNode {
    return null;
  }
}
