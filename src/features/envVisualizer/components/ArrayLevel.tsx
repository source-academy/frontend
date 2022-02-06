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
  height: number = 0;
  width: number;
  position: [x: number, y: number][][] = [[]];

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
    let level = 0;
    positions: for (const positions of this.position) {
      for (const position of positions) {
        if (position[0] <= x + array.width && position[1] >= x) {
          level++;
          continue positions;
        } else {
          continue;
        }
      }
      break;
    }

    this.position[level] = this.position[level] || [];
    this.position[level].push([x, x + array.width]);
    this.position[level].sort((a, b) => a[0] - b[0]);
    // Provide DataUnitHeight space between array layers.
    const curY = this.y + level * Config.DataUnitHeight + (level + 1) * Config.DataUnitHeight;
    array.updatePosition({ x, y: curY });
    this.height = Math.max(this.height, curY + (Config.DataUnitHeight + Config.DataUnitHeight));
    this.arrays.push(array);
    this.width = Math.max(this.width, x + array.width);
  };

  setY = (y: number) => {
    this.arrays.forEach(array => {
      return array.updatePosition({ x: array.x, y: array.y - this.y + y });
    });
    this.y = y;
  };

  static reset = () => {};

  draw(): React.ReactNode {
    return (
      // <React.Fragment key={Layout.key++}>
      <Group key={Layout.key++} ref={this.ref}>
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
