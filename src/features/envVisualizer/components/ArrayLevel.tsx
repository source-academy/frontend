// import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';

/** this class encapsulates a level of arrays to be drawn between two frame levels */
export class ArrayLevel extends Level {
  private _x: number;
  private _y: number;
  private _height: number = 0;
  private _width: number;
  position: [x: number, y: number][][] = [[]];

  ref: RefObject<any> = React.createRef();

  /** all the frames in this level */
  readonly arrays: ArrayValue[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: FrameLevel
  ) {
    super(parentLevel);
    this._x = Config.CanvasPaddingX;
    this._y = 0;
    this._width = 0;
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

  /**
   * Inserts array into ArrayLevel. Handles overlaps
   * @param array
   * @param x desired x-position of array
   */
  addArray = (array: ArrayValue, x: number) => {
    x = x || 0;
    let level = 0;
    positions: for (const positions of this.position) {
      for (const position of positions) {
        if (position[0] <= x + array.width() && position[1] >= x) {
          level++;
          continue positions;
        } else {
          continue;
        }
      }
      break;
    }

    this.position[level] = this.position[level] || [];
    this.position[level].push([x, x + array.width()]);
    this.position[level].sort((a, b) => a[0] - b[0]);
    const arrayMargin = Config.DataUnitHeight;
    const curY = this._y + level * Config.DataUnitHeight + (level + 1) * arrayMargin;
    array.updatePosition({ x, y: curY });
    array.setLevel(this);
    this._height = Math.max(this._height, curY + (Config.DataUnitHeight + arrayMargin));
    this.arrays.push(array);
    this._width = Math.max(this._width, x + array.width());
  };

  setY = (y: number) => {
    this.arrays.forEach(array => {
      return array.updatePosition({ x: array.x(), y: array.y() - this.y() + y });
    });
    this._y = y;
  };

  static reset = () => {};

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          key={Layout.key++}
          listening={false}
        />
        {this.arrays.map(array => array.draw())}
      </Group>
    );
  }
}
