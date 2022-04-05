import React, { RefObject } from 'react';
import { Line as KonvaLine } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { CompactReferenceType, ReferenceType, Visible } from '../EnvVisualizerTypes';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit implements Visible {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  arrayUnit: CompactReferenceType | ReferenceType;
  referencedBy: (CompactReferenceType | ReferenceType)[];
  ref: RefObject<any> = React.createRef();

  constructor(referencedBy: (CompactReferenceType | ReferenceType)[]) {
    this.referencedBy = referencedBy;
    this.arrayUnit = referencedBy[0];
    this._x = this.arrayUnit.x();
    this._y = this.arrayUnit.y();
    this._height = this.arrayUnit.height();
    this._width = this.arrayUnit.width();
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
