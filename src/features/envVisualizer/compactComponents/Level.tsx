import React, { RefObject } from 'react';
import { Group, Rect } from 'react-konva';

import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { EnvTreeNode, Visible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class Level implements Visible {
  readonly _x: number;
  readonly _y: number;
  readonly _height: number;
  readonly _width: number;
  ref: RefObject<any> = React.createRef();

  /** all the frames in this level */
  readonly frames: Frame[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: Level | null,
    /** the environment tree nodes contained in this level */
    readonly envTreeNodes: EnvTreeNode[]
  ) {
    this._x = CompactConfig.CanvasPaddingX;
    this._y = CompactConfig.CanvasPaddingY;
    this.parentLevel && (this._y += this.parentLevel.height() + this.parentLevel.y());
    let prevFrame: Frame | null = null;
    envTreeNodes.forEach(e => {
      e.compactLevel = this;
      const newFrame = new Frame(e, prevFrame);
      e.compactFrame = newFrame;
      this.frames.push(newFrame);
      prevFrame = newFrame;
    });

    // get the max height of all the frames in this level
    this._height = this.frames.reduce<number>(
      (maxHeight, frame) => Math.max(maxHeight, frame.totalHeight),
      0
    );
    const lastFrame = this.frames[this.frames.length - 1];
    // derive the width of this level from the last frame
    this._width = lastFrame.x() + lastFrame.totalWidth - this.x() + CompactConfig.LevelPaddingX;
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  width(): number {
    return this._width;
  }
  height(): number {
    return this._height;
  }
  destroy() {
    this.ref.current.destroyChildren();
  }

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
        {this.frames.map(frame => frame.draw())}
      </Group>
    );
  }
}
