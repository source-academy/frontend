import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import { getTextHeight, getTextWidth } from '../EnvVisualizerUtils';
import { ArrowFromStackItemComponent } from './arrows/ArrowFromStackItemComponent';
import { Frame } from './Frame';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';

export class StackItemComponent extends Visible implements IHoverable {
  readonly text: string;
  readonly arrow?: ArrowFromStackItemComponent;

  constructor(
    readonly value: any,
    readonly isAgenda: boolean,
    stackHeightWidth: number,
    arrowTo?: Frame | FnValue | GlobalFnValue
  ) {
    super();
    this.text = String(value);
    this._width = this.isAgenda
      ? AgendaStashConfig.AgendaItemWidth
      : Math.min(
          AgendaStashConfig.AgendaItemTextPadding * 2 +
            getTextWidth(
              this.text,
              `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`
            ),
          AgendaStashConfig.AgendaItemWidth
        );
    this._height =
      (this.isAgenda
        ? getTextHeight(
            this.text,
            isAgenda ? AgendaStashConfig.AgendaMaxTextWidth : AgendaStashConfig.StashMaxTextWidth,
            `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`,
            AgendaStashConfig.FontSize
          )
        : AgendaStashConfig.StashMaxTextHeight) +
      AgendaStashConfig.AgendaItemTextPadding * 2;
    this._x = isAgenda
      ? AgendaStashConfig.AgendaPosX
      : AgendaStashConfig.StashPosX + stackHeightWidth;
    this._y = isAgenda
      ? AgendaStashConfig.AgendaPosY + stackHeightWidth
      : AgendaStashConfig.StashPosY;
    if (arrowTo) {
      this.arrow = new ArrowFromStackItemComponent(this);
      this.arrow.to(arrowTo);
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {};

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {};

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
        <Label
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <Tag {...ShapeDefaultProps} {...tagProps} />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            key={Layout.key++}
            text={String(this.text)}
            width={this.width()}
            height={this.height()}
          />
        </Label>
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
