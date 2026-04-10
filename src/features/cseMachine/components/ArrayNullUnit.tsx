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

  setX(x: number): void {
    this._x = x;
  }

  setY(y: number): void {
    this._y = y;
  }

  draw(): React.ReactNode {
    // needs to be recalculated here unlike arrayunit, as primitive value treat it as a text
    this._x = this.reference.x();
    this._y = this.reference.y();
    const strokeColor =
      this.reference.parent.isReferenced() && this.reference.parent.isEnclosingFrameLive()
        ? defaultStrokeColor()
        : fadedStrokeColor();

    return (
      <KonvaLine
        {...ShapeDefaultProps}
        key={Layout.key++}
        points={[this.x(), this.y() + this.height(), this.x() + this.width(), this.y()]}
        stroke={strokeColor}
        hitStrokeWidth={Config.DataHitStrokeWidth}
        ref={this.ref}
        listening={false}
      />
    );
  }
}
