import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode } from '../EnvVisualizerTypes';
import { ArrayLevel } from './ArrayLevel';
import { Frame } from './Frame';
import { Level } from './Level';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class FrameLevel extends Level {
  private _x: number;
  private _y: number;
  private _width: number;
  static maxXcoord: number = 0;
  static maxYcoord: number = 0;
  lastXcoord: number;
  readonly yCoord: number;
  ref: RefObject<any> = React.createRef();

  /** all the frames in this level */
  readonly frames: Frame[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: ArrayLevel | null
  ) {
    super(parentLevel);
    this._x = Config.CanvasPaddingX;
    this._y = 0;
    this._width = 0;
    this.lastXcoord = -1;
    this.yCoord = FrameLevel.maxYcoord++;
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return Frame.heights[this.yCoord] + Config.FrameMarginY;
  }
  width(): number {
    return this._width;
  }

  /**
   * Insert the next frame into this FrameLevel.
   * @param node
   */
  addFrame = (node: EnvTreeNode) => {
    // const coordinate: number = this.lastXcoord + 1;
    // const coordinate: number = Math.max(FrameLevel.maxXcoord, this.lastXcoord + 1);
    // array not at left of immediate parent frame.
    const coordinate: number = Math.max(this.lastXcoord + 1, node.parent?.frame?.xCoord ?? 0);
    this.lastXcoord = coordinate;
    FrameLevel.maxXcoord = Math.max(FrameLevel.maxXcoord, coordinate);
    node.level = this;
    if (this.frames[coordinate] !== undefined) {
      this.frames[coordinate].update(node);
    } else {
      this.frames[coordinate] = new Frame(node, coordinate, this.yCoord);
      node.frame = this.frames[coordinate];
    }
    this._width = Frame.maxX;
  };

  /**
   * set y-position of frame level, and updates y-position of all frames in level
   * @param y target y-coordinate
   */
  setY = (y: number) => {
    this._y = y;
    this.frames.forEach(frame => {
      frame.updatePosition(frame.x(), y);
    });
  };

  static reset = () => {
    FrameLevel.maxXcoord = 0;
    FrameLevel.maxYcoord = 0;
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
        {this.frames.reverse().map(frame => frame.draw())}
      </Group>
    );
  }
}
