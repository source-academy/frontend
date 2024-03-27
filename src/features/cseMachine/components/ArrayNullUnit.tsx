import React from 'react';
import { Line as KonvaLine } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { defaultSAColor } from '../CseMachineUtils';
import { ArrayUnit } from './ArrayUnit';
import { Visible } from './Visible';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit extends Visible {
  referencedBy: ArrayUnit;

  constructor(referencedBy: ArrayUnit) {
    super();
    this.referencedBy = referencedBy;
    this._x = referencedBy.x();
    this._y = referencedBy.y();
    this._height = referencedBy.height();
    this._width = referencedBy.width();
  }

  updatePosition = () => {};

  draw(): React.ReactNode {
    return (
      <KonvaLine
        {...ShapeDefaultProps}
        key={Layout.key++}
        points={[this.x(), this.y() + this.height(), this.x() + this.width(), this.y()]}
        stroke={defaultSAColor()}
        hitStrokeWidth={Config.DataHitStrokeWidth}
        ref={this.ref}
        listening={false}
      />
    );
  }
}
