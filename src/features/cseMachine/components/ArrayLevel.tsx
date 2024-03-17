import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { FrameLevel } from './FrameLevel';
import { Level } from './Level';
import { ArrayValue } from './values/ArrayValue';
import { Value } from './values/Value';

/** this class encapsulates a level of arrays to be drawn between two frame levels */
export class ArrayLevel extends Level {
  private _minX: number = Infinity;
  private _count: number = 0;
  position: [x: number, y: number][][] = [[]];

  // Prevent new arrays from being placed above existing arrays in the array level
  private _rowCount: number = 0;

  /** all the frames in this level */
  readonly arrays: ArrayValue[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: FrameLevel
  ) {
    super(parentLevel);
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._rowCount = 0;
  }

  minX(): number {
    return this._minX;
  }
  count(): number {
    return this._count;
  }
  getNumLanes = (): number => {
    return this._rowCount;
  };

  /**
   * Inserts array into ArrayLevel. Handles overlaps
   * @param array
   * @param x desired x-position of array
   */
  addArray = (array: ArrayValue, x: number) => {
    x = x || 0;
    // set highest allowed y-position to highest existing y-position in group of arrays connected to array.

    let level = array.parentArray?.arrayLevelY ?? 0;
    let width = 0;
    let tail: Value = array;
    const visitedTail: Value[] = [];
    while (tail instanceof ArrayValue) {
      if (visitedTail.includes(tail)) {
        break;
      }
      visitedTail.push(tail);
      width += Config.DataUnitPaddingX + tail.units.length * Config.DataUnitWidth;
      if (tail.units.length > 0 && tail.units[tail.units.length - 1].value instanceof ArrayValue) {
        tail = tail.units[tail.units.length - 1].value;
      }
    }
    // Determine the highest allowed y-position for new array
    positions: for (const positions of this.position.slice(level)) {
      for (const position of positions) {
        // Prevent new arrays from being created above existing arrays in level
        if (position[0] < x + width + Config.DataMinWidth && position[1] > x) {
          level++;
          continue positions;
        }
      }
      break;
    }
    this._minX = Math.min(x, this._minX);
    this._count++;
    this._rowCount = Math.max(this._rowCount, level);
    this.position[level] = this.position[level] || [];
    this.position[level].push([x, x + array.width() + Config.DataUnitWidth / 2]);
    this.position[level].sort((a, b) => a[0] - b[0]);
    const arrayMargin = Config.DataUnitPaddingY;
    const curY = this._y + level * Config.DataUnitHeight + (level + 1) * arrayMargin;
    array.updatePosition({ x, y: curY });
    array.setLevel(this, level);
    this._height = Math.max(this._height, curY + arrayMargin);
    this.arrays.push(array);
    this._width = Math.max(this._width, x + array.width());
  };

  setY = (y: number) => {
    this.arrays.forEach(array => {
      return array.updatePosition({ x: array.x(), y: array.y() - this.y() + y });
    });
    this._y = y;
  };

  reset = () => {
    this._minX = Infinity;
    this._count = 0;
  };

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
