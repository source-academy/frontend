import React from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { EnvTreeNode } from '../CseMachineTypes';
import { ArrayLevel } from './ArrayLevel';
import { Frame } from './Frame';
import { Level } from './Level';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class FrameLevel extends Level {
  static maxXcoord: number = 0;
  static maxYcoord: number = 0;
  lastXcoord: number;
  readonly yCoord: number;

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

  height(): number {
    return Frame.heights[this.yCoord] + Config.FrameMarginY;
  }

  /**
   * Insert the next frame into this FrameLevel.
   * If node.xCoord is specified and is valid (right of existing frames on level), uses it.
   * else, places the frame to the right of the last frame on level.
   * (calculate xCoord of frames, and addFrames in order from left to right and top to bottom.)
   * @param node
   */
  addFrame = (node: EnvTreeNode) => {
    // use the node's xCoord if its set and to right of last frame in level, else use put at right of last frame in level.
    const coordinate = Math.max(node.xCoord ?? 0, FrameLevel.maxXcoord, this.lastXcoord + 1);
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
