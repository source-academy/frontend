// import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { Config, ShapeDefaultProps } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode, Visible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class Level implements Visible {
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
    readonly parentLevel: Level | null
  ) {
    this.x = Config.CanvasPaddingX;
    this.y = 0;
    this.lastXcoord = -1;
    this.yCoord = Level.maxYcoord++;
    this.width = 0;
    this.parentLevel && (this.y += this.parentLevel.height + this.parentLevel.y);
  }

  addFrame = (node: EnvTreeNode) => {
    const coordinate: number = Math.max(Level.maxXcoord, this.lastXcoord + 1);
    this.lastXcoord = coordinate;
    Level.maxXcoord = coordinate;
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
    Level.maxXcoord = 0;
    Level.maxYcoord = 0;
  };

  draw(): React.ReactNode {
    return (
      // <React.Fragment key={Layout.key++}>
      <Group key={Layout.key++} ref={this.ref} draggable={false}>
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
