// import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class ArrayLevel extends Level {
  readonly x: number;
  y: number;
  height: number = Config.DataUnitHeight;
  width: number;

  ref: RefObject<any> = React.createRef();

  /** all the frames in this level */
  readonly arrays: ArrayValue[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: FrameLevel
  ) {
    super(parentLevel);
    this.x = Config.CanvasPaddingX;
    this.y = 0;
    this.width = 0;
  }

  addArray = (array: ArrayValue, x: number) => {
    x = x || 0;
    array.updatePosition({ x, y: this.y });
    this.arrays.push(array);
    debugger;
    this.width = Math.max(this.width, x + array.width);
  };

  setY = (y: number) => {
    this.y = y;
    this.arrays.forEach(array => {
      return array.updatePosition({ x: array.x, y });
    });
  };

  static reset = () => {};

  draw(): React.ReactNode {
    return (
      // <React.Fragment key={Layout.key++}>
      <Group key={Layout.key++} ref={this.ref} draggable={true}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          key={Layout.key++}
          listening={false}
        />
        {this.arrays.map(array => array.draw())}
      </Group>
      // {/* </React.Fragment> */}
    );
  }
}
