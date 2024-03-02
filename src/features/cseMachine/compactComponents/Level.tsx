import React from 'react';
import { Group, Rect } from 'react-konva';

import { Visible } from '../components/Visible';
import CseMachine from '../CseMachine';
import { CompactConfig, ShapeDefaultProps } from '../CseMachineCompactConfig';
import { ControlStashConfig } from '../CseMachineControlStash';
import { Layout } from '../CseMachineLayout';
import { EnvTreeNode } from '../CseMachineTypes';
import { Frame } from './Frame';

/** this class encapsulates a level of frames to be drawn with the same y values */
export class Level extends Visible {
  /** all the frames in this level */
  readonly frames: Frame[] = [];

  constructor(
    /** the level of this */
    readonly parentLevel: Level | null,
    /** the environment tree nodes contained in this level */
    readonly envTreeNodes: EnvTreeNode[]
  ) {
    super();
    this._x = CseMachine.getControlStash()
      ? ControlStashConfig.ControlPosX +
        ControlStashConfig.ControlItemWidth +
        CompactConfig.CanvasPaddingX
      : CompactConfig.CanvasPaddingX;
    this._y = CompactConfig.CanvasPaddingY;
    CseMachine.getControlStash() &&
      !this.parentLevel &&
      (this._y +=
        ControlStashConfig.StashItemHeight + ControlStashConfig.ControlItemTextPadding * 3);
    this.parentLevel && (this._y += this.parentLevel.height() + this.parentLevel.y());
    let prevFrame: Frame | null = null;
    envTreeNodes.forEach(e => {
      e.compactLevel = this;
      const newFrame = new Frame(e, prevFrame);
      e.compactFrame = newFrame;
      this.frames.push(newFrame);
      prevFrame = newFrame;
    });

    // get the max height of all the frames in this level including the label
    this._height = this.frames.reduce<number>(
      (maxHeight, frame) => Math.max(maxHeight, frame.totalHeight),
      0
    );
    const lastFrame = this.frames[this.frames.length - 1];
    // derive the width of this level from the last frame
    this._width = lastFrame.x() + lastFrame.totalWidth - this.x() + CompactConfig.LevelPaddingX;
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
