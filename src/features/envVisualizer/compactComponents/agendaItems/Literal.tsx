import { KonvaEventObject } from 'konva/lib/Node';
import { Group, Rect } from 'react-konva';

import { Visible } from '../../components/Visible';
import { CompactConfig, ShapeDefaultProps } from '../../EnvVisualizerCompactConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { IHoverable, PrimitiveTypes } from '../../EnvVisualizerTypes';
import { Text } from '../Text';

export class Literal extends Visible implements IHoverable {
  readonly text: Text;
  constructor(readonly value: PrimitiveTypes) {
    super();
    this._x = CompactConfig.CanvasPaddingX;
    this._y = CompactConfig.CanvasPaddingY;
    this.text = new Text(value, this.x(), this.y());
  }

  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}

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
        {this.text.draw()}
      </Group>
    );
  }
}
