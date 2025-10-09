import React from 'react';
import { Group, Rect } from 'react-konva';
import { Memory as CMemory, StackFrame } from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { defaultTextColor } from '../../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CConfig, ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';
import { MemoryStackFrame } from './MemoryStackFrame';

export class Memory extends Visible {
  textProps = {
    fill: defaultTextColor(),
    padding: CControlStashMemoryConfig.ControlItemTextPadding,
    fontFamily: CControlStashMemoryConfig.FontFamily,
    fontSize: CControlStashMemoryConfig.FontSize,
    fontStyle: CControlStashMemoryConfig.FontStyle,
    fontVariant: CControlStashMemoryConfig.FontVariant
  };

  memory: CMemory;
  frames: MemoryStackFrame[] = [];

  constructor(memory: CMemory, frames: StackFrame[]) {
    super();
    this.memory = memory;
    this.frames = [];

    this._x =
      CControlStashMemoryConfig.ControlPosX +
      CControlStashMemoryConfig.ControlItemWidth +
      2 * CConfig.CanvasPaddingX +
      CConfig.FrameMaxWidth;

    this._y =
      CControlStashMemoryConfig.StashPosY +
      CControlStashMemoryConfig.StashItemHeight +
      2 * CConfig.CanvasPaddingY;

    this._width = CControlStashMemoryConfig.memoryRowWidth;
    let currentY = this._y;

    this.frames = [...frames].reverse().map(frame => {
      const newMemoryStackFrame = new MemoryStackFrame(this._x, currentY, this.memory, frame);
      currentY += newMemoryStackFrame.height();
      return newMemoryStackFrame;
    });

    this._height = 1000;
  }

  draw(): React.ReactNode {
    return (
      <Group key={CseMachine.key++}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={'#999'}
          strokeWidth={2}
          fill="transparent"
          cornerRadius={Number(CConfig.FrameCornerRadius)}
        />
        {this.frames.map(frame => frame.draw())}
      </Group>
    );
  }
}
