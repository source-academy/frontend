import React from 'react';
import { Line as KonvaLine } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { ReferenceType } from '../CseMachineTypes';
import { defaultSAColor } from '../CseMachineUtils';
import { Visible } from './Visible';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit extends Visible {
  arrayUnit: ReferenceType;
  referencedBy: ReferenceType[];

  constructor(referencedBy: ReferenceType[]) {
    super();
    this.referencedBy = referencedBy;
    this.arrayUnit = referencedBy[0];
    this._x = this.arrayUnit.x();
    this._y = this.arrayUnit.y();
    this._height = this.arrayUnit.height();
    this._width = this.arrayUnit.width();
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
