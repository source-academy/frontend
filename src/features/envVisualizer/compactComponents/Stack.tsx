import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import { AgendaItem, InstrType } from 'js-slang/dist/ec-evaluator/types';
import { isInstr, isNode } from 'js-slang/dist/ec-evaluator/utils';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getAgendaItemComponent, getStashItemComponent } from '../EnvVisualizerUtils';
import { StackItemComponent } from './StackItemComponent';

export class Stack extends Visible implements IHoverable {
  /** Whether the stack is the Agenda or Stash */
  readonly isAgenda: boolean;
  /** Array of the Agenda Item Components */
  readonly stackItemComponents: StackItemComponent[];

  constructor(readonly stack: Agenda | Stash) {
    super();
    this.isAgenda = stack instanceof Agenda;
    this._x = this.isAgenda ? AgendaStashConfig.AgendaPosX : Layout.stashComponentX;
    this._y = this.isAgenda ? AgendaStashConfig.AgendaPosY : AgendaStashConfig.StashPosY;
    this._width = this.isAgenda ? AgendaStashConfig.AgendaItemWidth : 0;
    this._height = this.isAgenda
      ? AgendaStashConfig.StashMaxTextHeight + AgendaStashConfig.AgendaItemTextPadding * 2
      : 0;
    // Function to convert the stack items to their components
    const stackItemToComponent = this.isAgenda
      ? (agendaItem: AgendaItem) => {
          if (isInstr(agendaItem) && agendaItem.instrType === InstrType.PUSH_UNDEFINED_IF_NEEDED) {
            return;
          }
          const node = isNode(agendaItem) ? agendaItem : agendaItem.srcNode;
          let highlightOnHover = () => {};
          let unhighlightOnHover = () => {};

          // TODO: Ideally we can split StackItemComponent into their Agenda and Stash counterparts
          highlightOnHover = () => {
            if (node.loc) {
              const start = node.loc.start.line - 1;
              const end = node.loc.end.line - 1;
              EnvVisualizer.setEditorHighlightedLines([[start, end]]);
            }
          };
          unhighlightOnHover = () => EnvVisualizer.setEditorHighlightedLines([]);
          const component = getAgendaItemComponent(
            agendaItem,
            this._height,
            highlightOnHover,
            unhighlightOnHover
          );
          this._height += component.height();

          return component;
        }
      : (stashItem: any) => {
          const component = getStashItemComponent(stashItem, this._width);
          this._width += component.width();
          this._height = Math.max(this._height, component.height());
          return component;
        };
    const num = EnvVisualizer.getStackTruncated() ? 10 : undefined;
    this.stackItemComponents = this.stack.mapStack(stackItemToComponent, num);
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {this.stackItemComponents.map(c => c?.draw())}
      </Group>
    );
  }
}
