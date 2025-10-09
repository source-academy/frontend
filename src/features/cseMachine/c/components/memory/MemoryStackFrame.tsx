import { Group as KonvaGroup, Rect } from 'react-konva';
import { Text as KonvaText } from 'react-konva';
import { Memory as CMemory, StackFrame } from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CseMachine } from '../../CseMachine';
import { MemoryRow } from './MemoryRow';

export class MemoryStackFrame extends Visible {
  public frame: StackFrame;
  public memory: CMemory;
  public byteRows: MemoryRow[];

  constructor(x: number, y: number, memory: CMemory, frame: StackFrame) {
    super();
    this._x = x;
    this._y = y;
    this.memory = memory;
    this.frame = frame;
    this.byteRows = [];

    // Loop from bottom to top, from stack pointer to basepointer + size of return
    let currentY = CControlStashMemoryConfig.memoryRowHeight;

    for (let i = frame.stackPointer; i <= frame.basePointer + frame.sizeOfReturn - 3; i += 4) {
      const newRow = new MemoryRow(i, memory.memory.buffer.slice(i, i + 4), 0, currentY);
      this.byteRows.push(newRow);
      currentY += newRow.height();
    }
    this._height = CControlStashMemoryConfig.memoryRowHeight;
    this.byteRows.forEach(row => (this._height += row.height()));
  }

  draw(key?: number): React.ReactNode {
    console.log(this.frame, this.memory, 'FUK YOUs');
    // if (!this.frame || !this.memory) {
    //   throw new Error('Cannot draw memory stack frame where fields are not instantiated');
    // }

    return (
      <KonvaGroup key={CseMachine.key++} x={this.x()} y={this.y()}>
        {/* function name */}
        <KonvaGroup key={CseMachine.key++}>
          <Rect
            key={CseMachine.key++}
            height={CControlStashMemoryConfig.memoryRowHeight}
            width={CControlStashMemoryConfig.memoryRowWidth}
            stroke={'#DBEAFE'}
            strokeWidth={1}
          />
          <KonvaText
            text={this.frame.functionName}
            fontSize={CControlStashMemoryConfig.FontSize}
            fill="#8EC5FF"
            width={CControlStashMemoryConfig.memoryRowWidth}
            height={CControlStashMemoryConfig.memoryRowHeight}
            align="center"
            verticalAlign="middle"
          />
        </KonvaGroup>

        {/* Memory segment */}
        <KonvaGroup>{this.byteRows.map(row => row.draw())}</KonvaGroup>
      </KonvaGroup>
    );
  }
}
