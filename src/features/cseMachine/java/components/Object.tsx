import { ECE } from 'java-slang';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../../components/Visible';
import { CseMachine } from '../CseMachine';
import { Frame } from './Frame';

export class Obj extends Visible {
  constructor(
    private readonly _frames: Frame[],
    private readonly _object: ECE.Object
  ) {
    super();

    // Position.
    this._x = _frames[0].x();
    this._y = _frames[0].y();

    // Height and width.
    this._height = this._frames.reduce((accHeight, currFrame) => accHeight + currFrame.height(), 0);
    this._width = this._frames.reduce(
      (maxWidth, currFrame) => Math.max(maxWidth, currFrame.width()),
      0
    );
  }

  get frames() {
    return this._frames;
  }

  get object() {
    return this._object;
  }

  getFrame(): Frame {
    return this._frames[this._frames.length - 1];
  }

  draw(): React.ReactNode {
    return <Group key={CseMachine.key++}>{this._frames.map(f => f.draw())}</Group>;
  }
}
