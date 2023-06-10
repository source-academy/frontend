import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import { AgendaItem } from 'js-slang/dist/ec-evaluator/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getAgendaItemComponent, getStashItemComponent } from '../EnvVisualizerUtils';
import { ModelLabel } from './ModelLabel';
import { StackItemComponent } from './StackItemComponent';

export class Stack extends Visible implements IHoverable {
  /** Whether the stack is the Agenda or Stash */
  readonly isAgenda: boolean;
  /** Array of the Agenda Item Components */
  readonly stackItemComponents: StackItemComponent[];
  readonly modelLabel: ModelLabel;

  constructor(readonly stack: Agenda | Stash) {
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
          this._height += component ? component.height() : 0;
          return component;
        }
      : (stashItem: any) => {
          const component = getStashItemComponent(stashItem, this._height);
          this._height += component ? component.height() : 0;
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
