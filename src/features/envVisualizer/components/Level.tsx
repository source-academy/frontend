import React from 'react';
import { Rect } from 'react-konva';

import { Config } from '..//EnvVisualizerConfig';
import { Layout } from '..//EnvVisualizerLayout';
import { _EnvTreeNode, Visible } from '..//EnvVisualizerTypes';
import { Frame } from './Frame';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class Level implements Visible {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;

  /** all the frames in this level */
  readonly frames: Frame[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: Level | null,
    /** the environment tree nodes contained in this level */
    readonly envTreeNodes: _EnvTreeNode[]
  ) {
    this.x = Config.CanvasPaddingX;
    this.y = Config.CanvasPaddingY;
    this.parentLevel && (this.y += this.parentLevel.height + this.parentLevel.y);
    let prevFrame: Frame | null = null;
    envTreeNodes.forEach(e => {
      e.level = this;
      const newFrame = new Frame(e, prevFrame);
      e.frame = newFrame;
      this.frames.push(newFrame);
      prevFrame = newFrame;
    });

    // get the max height of all the frames in this level
    this.height = this.frames.reduce<number>(
      (maxHeight, frame) => Math.max(maxHeight, frame.totalHeight),
      0
    );
    const lastFrame = this.frames[this.frames.length - 1];
    // derive the width of this level from the last frame
    this.width = lastFrame.x + lastFrame.totalWidth - this.x + Config.LevelPaddingX;
  }

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        <Rect
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          key={Layout.key++}
          listening={false}
        />
        {this.frames.map(frame => frame.draw())}
      </React.Fragment>
    );
  }
}
