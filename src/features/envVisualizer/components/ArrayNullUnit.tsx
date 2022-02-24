import React, { RefObject } from 'react';
import { Line as KonvaLine } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { ReferenceType, Visible } from '../EnvVisualizerTypes';

/** this classes encapsulates a null value in Source pairs or arrays */
export class ArrayNullUnit implements Visible {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  arrayUnit: ReferenceType;
  referencedBy: ReferenceType[];
  ref: RefObject<any> = React.createRef();

  constructor(referencedBy: ReferenceType[]) {
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

  updatePosition = () => {
    this._x = this.arrayUnit.x();
    this._y = this.arrayUnit.y();
  };

  draw(): React.ReactNode {
    return (
      <KonvaLine
        {...ShapeDefaultProps}
        key={Layout.key++}
        points={[this.x(), this.y() + this.height(), this.x() + this.width(), this.y()]}
        stroke={
          EnvVisualizer.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
        }
        hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
        ref={this.ref}
      />
    );
  }
}
