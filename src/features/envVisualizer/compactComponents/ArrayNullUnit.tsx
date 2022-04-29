import React from 'react';
import { Line as KonvaLine } from 'react-konva';

import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { CompactReferenceType, ReferenceType } from '../EnvVisualizerTypes';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit extends Visible {
  arrayUnit: CompactReferenceType | ReferenceType;
  referencedBy: (CompactReferenceType | ReferenceType)[];

  constructor(referencedBy: (CompactReferenceType | ReferenceType)[]) {
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
        stroke={
          EnvVisualizer.getPrintableMode()
            ? CompactConfig.SA_BLUE.toString()
            : CompactConfig.SA_WHITE.toString()
        }
        hitStrokeWidth={Number(CompactConfig.DataHitStrokeWidth)}
        ref={this.ref}
        listening={false}
      />
    );
  }
}
