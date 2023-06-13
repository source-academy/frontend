import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import { AgendaItem } from 'js-slang/dist/ec-evaluator/types';
import { isNode } from 'js-slang/dist/ec-evaluator/utils';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  getAgendaItemComponent,
  getStashItemComponent,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle
} from '../EnvVisualizerUtils';
import { StackItemComponent } from './StackItemComponent';

export class Stack extends Visible implements IHoverable {
  /** Whether the stack is the Agenda or Stash */
  readonly isAgenda: boolean;
  /** Array of the Agenda Item Components */
  readonly stackItemComponents: StackItemComponent[];

  constructor(
    readonly stack: Agenda | Stash,
    setEditorHighlightedLines?: (start?: number, end?: number) => void
  ) {
    super();
    this.isAgenda = stack instanceof Agenda;
    this._x = this.isAgenda ? AgendaStashConfig.AgendaPosX : Layout.stashComponentX;
    this._y = this.isAgenda ? AgendaStashConfig.AgendaPosY : AgendaStashConfig.StashPosY;
    this._width = this.isAgenda ? AgendaStashConfig.AgendaItemWidth : 0;
    this._height = this.isAgenda ? AgendaStashConfig.StashMaxTextHeight + AgendaStashConfig.AgendaItemTextPadding * 2 : 0;
    // Function to convert the stack items to their components
    const stackItemToComponent = this.isAgenda
      ? (agendaItem: AgendaItem) => {
          const component = getAgendaItemComponent(agendaItem, this._height);
          this._height += component.height();

          // TODO: refactor to put this logic inside StackItemComponent
          if (isNode(agendaItem) && setEditorHighlightedLines) {
            component.onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
              // TODO: Refactor to force nodes to have loc property (in js-slang)
              if (agendaItem.loc) {
                const start = agendaItem.loc.start.line - 1;
                const end = agendaItem.loc.end.line - 1;
                setEditorHighlightedLines(start, end);
                setHoveredStyle(e.currentTarget);
                setHoveredCursor(e.currentTarget);
              }
            };
            component.onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
              setEditorHighlightedLines();
              setUnhoveredStyle(e.currentTarget);
              setUnhoveredCursor(e.currentTarget);
            };
          }
          return component;
        }
      : (stashItem: any) => {
          const component = getStashItemComponent(stashItem, this._width);
          this._width += component.width();
          this._height = Math.max(this._height, component.height());
          return component;
        };
    this.stackItemComponents = this.stack.mapStack(stackItemToComponent);
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
