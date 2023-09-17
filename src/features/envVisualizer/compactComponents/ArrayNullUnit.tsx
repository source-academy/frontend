import React from 'react';
import { Line as KonvaLine } from 'react-konva';
import { Visible } from 'src/features/envVisualizer/components/Visible';
import {
  CompactConfig,
  ShapeDefaultProps
} from 'src/features/envVisualizer/EnvVisualizerCompactConfig';
import { Layout } from 'src/features/envVisualizer/EnvVisualizerLayout';
import { CompactReferenceType, ReferenceType } from 'src/features/envVisualizer/EnvVisualizerTypes';
import { defaultSAColor } from 'src/features/envVisualizer/EnvVisualizerUtils';

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
        stroke={defaultSAColor()}
        hitStrokeWidth={Number(CompactConfig.DataHitStrokeWidth)}
        ref={this.ref}
        listening={false}
      />
    );
  }
}
