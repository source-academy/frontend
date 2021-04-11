import React from 'react';
import { Rect } from 'react-konva';

import { Config } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Visible } from '../EnvVisualizerTypes';
import { Frame } from './Frame';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class Level implements Visible {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly frames: Frame[];

  constructor(
    /** the level above this */
    readonly parentLevel: Level | null
  ) {
    this.x = Config.CanvasPaddingX;
    this.y = Config.CanvasPaddingY;
    this.parentLevel && (this.y += this.parentLevel.height + this.parentLevel.y);

    // initialize frames
    const frames: Frame[] = [];
    if (this.parentLevel) {
      this.parentLevel.frames.forEach(frame =>
        frame.environment.childEnvs?.forEach(env => {
          const newFrame = new Frame(
            env,
            frame,
            frames.length > 0 ? frames[frames.length - 1] : null,
            this
          );
          frames.push(newFrame);
          env.frame = newFrame;
        })
      );
    } else {
      // empty parent level means this is the first level and hence contains only the global frame
      const { globalEnv } = Layout;
      const newFrame = new Frame(globalEnv, null, null, this);
      frames.push(newFrame);
      globalEnv.frame = newFrame;
    }

    this.frames = frames;

    // get the max height of all the frames in this level
    this.height = this.frames.reduce<number>(
      (maxHeight, frame) => Math.max(maxHeight, frame.totalHeight),
      0
    );

    // derive the width of this level from the last frame
    const lastFrame = this.frames[this.frames.length - 1];
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
