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
  setHoveredStyle,
  setUnhoveredStyle
} from '../EnvVisualizerUtils';
import { ModelLabel } from './ModelLabel';
import { StackItemComponent } from './StackItemComponent';

export class Stack extends Visible implements IHoverable {
  /** Whether the stack is the Agenda or Stash */
  readonly isAgenda: boolean;
  /** Array of the Agenda Item Components */
  readonly stackItemComponents: StackItemComponent[];
  readonly modelLabel: ModelLabel;

  constructor(
    readonly stack: Agenda | Stash,
    setEditorHighlightedLines?: (start?: number, end?: number) => void
  ) {
    super();
    this.isAgenda = stack instanceof Agenda;
    this._x = this.isAgenda ? AgendaStashConfig.AgendaPosX : Layout.stashComponentX;
    this._y = this.isAgenda ? AgendaStashConfig.AgendaPosY : AgendaStashConfig.StashPosY;
    this._width = AgendaStashConfig.AgendaItemWidth;
    // Account for the Agenda and Stash labels in the height
    this._height = AgendaStashConfig.FontSize + AgendaStashConfig.AgendaItemTextPadding * 2;
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
                console.log('onmouseenter');
              }
            };
            component.onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
              // make new action for removal
              // get marker id
              setEditorHighlightedLines();
              setUnhoveredStyle(e.currentTarget);
              console.log('onmouseleave');
            };
          }
          return component;
        }
      : (stashItem: any) => {
          const component = getStashItemComponent(stashItem, this._height);
          this._height += component.height();
          return component;
        };
    this.stackItemComponents = this.stack.mapStack(stackItemToComponent);
    this.modelLabel = new ModelLabel(this.isAgenda ? 'Agenda' : 'Stack', this.x());
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        {this.modelLabel.draw()}
        {this.stackItemComponents.map(c => c?.draw())}
      </Group>
    );
  }
}
