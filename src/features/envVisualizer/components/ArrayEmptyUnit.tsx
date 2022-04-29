import React, { RefObject } from 'react';
import { Rect } from 'react-konva';

import EnvVisualizer from '../EnvVisualizer';
import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data } from '../EnvVisualizerTypes';
import { ArrayValue } from './values/ArrayValue';
import { Visible } from './Visible';

/** this classes encapsulates an empty array */
export class ArrayEmptyUnit extends Visible {
  readonly value: null = null;

  readonly data: Data = [];
  ref: RefObject<any> = React.createRef();

  constructor(readonly parent: ArrayValue) {
    super();
    this._x = this.parent.x();
    this._y = this.parent.y();
    this._height = this.parent.height();
    this._width = this.parent.width();
  }

  updatePosition = () => {
    this._x = this.parent.x();
    this._y = this.parent.y();
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
        ref={this.ref}
      />
    );
  }
}
