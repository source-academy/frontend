import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Rect } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Hoverable, Visible } from '../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../EnvVisualizerUtils';
import { ArrayValue } from './values/ArrayValue';

/** this classes encapsulates an empty array */
export class ArrayEmptyUnit implements Visible, Hoverable {
  readonly _x: number;
  readonly _y: number;
  readonly _height: number;
  readonly _width: number;

  readonly data: Data = [];

  constructor(readonly parent: ArrayValue) {
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
  ref?: React.RefObject<any> | undefined;

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    return (
      <Rect
        {...ShapeDefaultProps}
        key={Layout.key++}
        x={this.x()}
        y={this.y()}
        width={this.width()}
        height={this.height()}
        stroke={
          EnvVisualizer.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
        }
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      />
    );
  }
}
