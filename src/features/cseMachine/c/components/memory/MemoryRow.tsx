import { Group as KonvaGroup, Rect } from 'react-konva';
import { Text as KonvaText } from 'react-konva';

import { Visible } from '../../../components/Visible';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CseMachine } from '../../CseMachine';
import { Text } from '../ui/Text';

export class MemoryRow extends Visible {
  address: number = 0;
  bytes: Uint8Array;

  constructor(address: number, bytes: ArrayBuffer, x: number, y: number) {
    super();
    this._x = x;
    this._y = y;
    this.address = address;
    this.bytes = new Uint8Array(bytes);
    this._height = CControlStashMemoryConfig.memoryRowHeight;
    this._width = CControlStashMemoryConfig.memoryRowWidth;
    console.log(this.bytes);
  }

  draw(key?: number): React.ReactNode {
    const padding = CControlStashMemoryConfig.byteBoxPadding;
    const addressText = new Text(
      `0x${this.address.toString(16).padStart(2, '0').toUpperCase()}`,
      this.x() + padding,
      this.y() + 5,
    );
    const totalBytes = this.bytes.length;
    const totalPadding = padding * (totalBytes - 1);
    const byteBoxesStartX =
      this.x() +
      this.width() -
      (totalBytes * CControlStashMemoryConfig.byteBoxWidth + totalPadding + padding);

    return (
      <KonvaGroup key={CseMachine.key++}>
      {/* address */}
      {addressText.draw()}

      {/* byte boxes */}
      {Array.from(this.bytes).map((value: number, index: number) => (
        <KonvaGroup
        key={CseMachine.key++}
        x={byteBoxesStartX + index * (CControlStashMemoryConfig.byteBoxWidth + padding)}
        y={this.y()}
        >
        <Rect
          width={CControlStashMemoryConfig.byteBoxWidth}
          height={CControlStashMemoryConfig.byteBoxHeight}
          stroke="white"
          strokeWidth={1}
          cornerRadius={2}
        />
        <KonvaText
          text={value.toString(16).toUpperCase().padStart(2, '0')}
          fontSize={CControlStashMemoryConfig.FontSize}
          fill="white"
          width={CControlStashMemoryConfig.byteBoxWidth}
          height={CControlStashMemoryConfig.byteBoxHeight}
          align="center"
          verticalAlign="middle"
        />
        </KonvaGroup>
      ))}
      </KonvaGroup>
    );
  }
}
