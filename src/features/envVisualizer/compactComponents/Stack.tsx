import { Agenda, Stash } from 'js-slang/dist/ec-evaluator/interpreter';
import { AgendaItem } from 'js-slang/dist/ec-evaluator/types';
import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Group, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getAgendaItemComponent, getStashItemComponent } from '../EnvVisualizerUtils';
import { StackItemComponent } from './StackItemComponent';
import { defaultOptions } from './Text';

export class Stack extends Visible implements IHoverable {
  /** Whether the stack is the Agenda or Stash */
  readonly isAgenda: boolean;
  /** Array of the Agenda Item Components */
  readonly stackItemComponents: StackItemComponent[];

  constructor(readonly stack: Agenda | Stash) {
    super();
    this.isAgenda = stack instanceof Agenda;
    this._x = this.isAgenda ? AgendaStashConfig.AgendaPosX : AgendaStashConfig.StashPosX;
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
    this.stackItemComponents = this.stack.reverseMapStack(stackItemToComponent);
  }
  onMouseEnter(e: KonvaEventObject<MouseEvent>): void {}
  onMouseLeave(e: KonvaEventObject<MouseEvent>): void {}

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      ...defaultOptions,
      fill: AgendaStashConfig.SA_WHITE.toString(),
      padding: Number(AgendaStashConfig.AgendaItemTextPadding),
      fontStyle: AgendaStashConfig.FontStyleHeader.toString(),
      fontSize: Number(AgendaStashConfig.FontSizeHeader)
    };
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <Text
          {...ShapeDefaultProps}
          {...textProps}
          x={this.x()}
          y={this.y()}
          text={this.isAgenda ? 'Agenda' : 'Stash'}
        />
        {this.stackItemComponents.map(c => c?.draw())}
      </Group>
    );
  }
}
