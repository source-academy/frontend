import React from 'react';
import { Line as KonvaLine } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { defaultStrokeColor, fadedStrokeColor } from '../CseMachineUtils';
import { ArrayUnit } from './ArrayUnit';
import { Visible } from './Visible';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit extends Visible {
  constructor(readonly reference: ArrayUnit) {
    super();
    this._x = reference.x();
    this._y = reference.y();
    this._height = reference.height();
    this._width = reference.width();
  }

  draw(): React.ReactNode {
    return (
      <KonvaLine
        {...ShapeDefaultProps}
        key={Layout.key++}
        points={[this.x(), this.y() + this.height(), this.x() + this.width(), this.y()]}
        stroke={this.reference.parent.isReferenced() ? defaultStrokeColor() : fadedStrokeColor()}
        hitStrokeWidth={Config.DataHitStrokeWidth}
        ref={this.ref}
        listening={false}
      />
    );
  }
}
