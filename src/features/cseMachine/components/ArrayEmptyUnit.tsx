import React from 'react';
import { Rect } from 'react-konva';

import { ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { defaultStrokeColor, fadedStrokeColor } from '../CseMachineUtils';
import { ArrayValue } from './values/ArrayValue';
import { Visible } from './Visible';

/** this classes encapsulates an empty array */
export class ArrayEmptyUnit extends Visible {
  readonly value: null = null;
  readonly data = undefined;

  constructor(readonly parent: ArrayValue) {
    super();
    this._x = this.parent.x();
    this._y = this.parent.y();
    this._height = this.parent.height();
    this._width = this.parent.width();
  }

  draw(): React.ReactNode {
    return (
      <Rect
        {...ShapeDefaultProps}
        key={Layout.key++}
        x={this.x()}
        y={this.y()}
        width={this.width()}
        height={this.height()}
        stroke={this.parent.isReferenced() ? defaultStrokeColor() : fadedStrokeColor()}
        ref={this.ref}
      />
    );
  }
}
