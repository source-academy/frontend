import React from 'react';
import { Rect } from 'react-konva';

import { Visible } from '../components/Visible';
import { ShapeDefaultProps } from '../CseMachineCompactConfig';
import { Layout } from '../CseMachineLayout';
import { Data } from '../CseMachineTypes';
import { defaultSAColor } from '../CseMachineUtils';
import { ArrayValue } from './values/ArrayValue';

/** this classes encapsulates an empty array */
export class ArrayEmptyUnit extends Visible {
  readonly value: null = null;

  readonly data: Data = [];

  constructor(readonly parent: ArrayValue) {
    super();
    this._x = this.parent.x();
    this._y = this.parent.y();
    this._height = this.parent.height();
    this._width = this.parent.width();
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }
  updatePosition = () => {
    this._x = this.parent.x();
    this._y = this.parent.y();
  };
  reset(): void {}

  draw(): React.ReactNode {
    return (
      <Rect
        {...ShapeDefaultProps}
        key={Layout.key++}
        x={this.x()}
        y={this.y()}
        width={this.width()}
        height={this.height()}
        stroke={defaultSAColor()}
        ref={this.ref}
      />
    );
  }
}
