// import { KonvaEventObject } from 'konva/lib/Node';
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
  readonly x: number;
  y: number;
  height: number = 0;
  width: number;
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
    this.x = Config.CanvasPaddingX;
    this.y = 0;
    this.height = 0;
    this.width = 0;
    this.lastXcoord = -1;
    this.yCoord = FrameLevel.maxYcoord++;
  }

  addFrame = (node: EnvTreeNode) => {
    const coordinate: number = Math.max(FrameLevel.maxXcoord, this.lastXcoord + 1);
    this.lastXcoord = coordinate;
    FrameLevel.maxXcoord = coordinate;
    node.level = this;
    if (this.frames[coordinate] !== undefined) {
      this.frames[coordinate].update(node);
    } else {
      this.frames[coordinate] = new Frame(node, coordinate, this.yCoord);
      node.frame = this.frames[coordinate];
    }
    this.width = Frame.cumWidths[Frame.cumWidths.length - 1];
  };

  setY = (y: number) => {
    this.y = y;
    this.frames.forEach(frame => {
      frame.updatePosition(frame.x, y);
    });
  };

  static reset = () => {
    FrameLevel.maxXcoord = 0;
    FrameLevel.maxYcoord = 0;
  };

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
        {this.frames.reverse().map(frame => frame.draw())}
      </Group>
      // {/* </React.Fragment> */}
    );
  }
}
