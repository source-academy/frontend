import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getTextHeight } from '../EnvVisualizerUtils';
import { ArrowFromStackItemComponent } from './arrows/ArrowFromStackItemComponent';
import { Frame } from './Frame';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';

export class StackItemComponent extends Visible implements IHoverable {
  static readonly maxTextWidth: number =
    AgendaStashConfig.AgendaItemWidth - AgendaStashConfig.AgendaItemTextPadding * 2 - 5;
  static readonly maxTextHeight: number =
    AgendaStashConfig.AgendaItemWidth - AgendaStashConfig.AgendaItemTextPadding * 2 - 5;
  readonly text: string;
  readonly arrow?: ArrowFromStackItemComponent;

  constructor(
    readonly value: any,
    isAgenda: boolean,
    stackHeight: number,
    arrowTo?: Frame | FnValue | GlobalFnValue
  ) {
    super();
    this._x = isAgenda ? Layout.agendaComponent.x() : Layout.stashComponent.x();
    this.text = String(value);
    this._width = AgendaStashConfig.AgendaItemWidth;
    this._height =
      getTextHeight(
        this.text,
        StackItemComponent.maxTextWidth,
        `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`,
        AgendaStashConfig.FontSize
      ) +
      AgendaStashConfig.AgendaItemTextPadding * 2;
    this._y = (isAgenda ? AgendaStashConfig.AgendaPosY : AgendaStashConfig.StashPosY) + stackHeight;
    if (arrowTo) {
      this.arrow = new ArrowFromStackItemComponent(this);
      this.arrow.to(arrowTo);
    }
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {};

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {};

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: AgendaStashConfig.SA_WHITE.toString(),
      padding: Number(AgendaStashConfig.AgendaItemTextPadding),
      fontFamily: AgendaStashConfig.FontFamily.toString(),
      fontSize: Number(AgendaStashConfig.FontSize),
      fontStyle: AgendaStashConfig.FontStyle.toString(),
      fontVariant: AgendaStashConfig.FontVariant.toString()
    };
    const tagProps = {
      stroke: EnvVisualizer.getPrintableMode()
        ? AgendaStashConfig.SA_BLUE.toString()
        : AgendaStashConfig.SA_WHITE.toString(),
      cornerRadius: Number(AgendaStashConfig.AgendaItemCornerRadius)
    };
    return (
      <React.Fragment key={Layout.key++}>
        <Label x={this.x()} y={this.y()}>
          <Tag {...ShapeDefaultProps} {...tagProps} />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            key={Layout.key++}
            text={String(this.text)}
            width={this.width()}
          />
        </Label>
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
