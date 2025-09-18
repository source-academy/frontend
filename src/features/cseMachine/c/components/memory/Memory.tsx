import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Memory as CMemory } from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { defaultTextColor } from '../../../CseMachineUtils';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CConfig, ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';
import { MemorySegment } from './MemorySegment';

export class Memory extends Visible {
  textProps = {
    fill: defaultTextColor(),
    padding: CControlStashMemoryConfig.ControlItemTextPadding,
    fontFamily: CControlStashMemoryConfig.FontFamily,
    fontSize: CControlStashMemoryConfig.FontSize,
    fontStyle: CControlStashMemoryConfig.FontStyle,
    fontVariant: CControlStashMemoryConfig.FontVariant
  };

  static memory: CMemory;
  static dataSegment: MemorySegment;
  static heapSegment: MemorySegment;
  static stackSegment: MemorySegment;

  constructor(memory: CMemory) {
    super();
    Memory.memory = memory;
    this._x =
      CControlStashMemoryConfig.ControlPosX +
      CControlStashMemoryConfig.ControlItemWidth +
      2 * CConfig.CanvasPaddingX +
      CConfig.FrameMaxWidth;

    this._y =
      CControlStashMemoryConfig.StashPosY +
      CControlStashMemoryConfig.StashItemHeight +
      2 * CConfig.CanvasPaddingY;

    this._width = Math.max(
      CConfig.FrameMinWidth,
      Math.min(CConfig.MemoryMinWidth, 100 + 2 * CConfig.FramePaddingX)
    );

    this._height = 1000
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
        <Text {...this.textProps} x={this.x()} y={this.y()} text="Memory" />
      </Group>
    );
  }
}
