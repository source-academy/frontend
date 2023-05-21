import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import { KonvaEventObject } from 'konva/lib/Node';
import { Group, Rect } from 'react-konva';

import { Visible } from '../components/Visible';
import { CompactConfig, ShapeDefaultProps } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getAgendaItemComponent } from '../EnvVisualizerUtils';

export class Stack extends Visible implements IHoverable {
  /** The stack of this component */
  readonly stack: Agenda | Stash;

  constructor(readonly currStack: Agenda | Stash) {
    super();
    this._x = CompactConfig.CanvasPaddingX;
    this._y = CompactConfig.CanvasPaddingY;
    this.stack = currStack;
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
        {this.stack.peek() && getAgendaItemComponent(this.stack.peek())?.draw()}
      </Group>
    );
  }
}
