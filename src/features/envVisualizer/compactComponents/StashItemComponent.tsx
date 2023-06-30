import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import { Visible } from '../components/Visible';
import EnvVisualizer from '../EnvVisualizer';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  getTextWidth,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../EnvVisualizerUtils';
import { ArrowFromStashItemComponent } from './arrows/ArrowFromStashItemComponent';
import { Frame } from './Frame';

export class StashItemComponent extends Visible implements IHoverable {
  /** text to display */
  readonly text: string;
  readonly arrow?: ArrowFromStashItemComponent;

  constructor(
    readonly value: any,
    stackHeightWidth: number,
    arrowTo?: Frame | FnValue | GlobalFnValue
  ) {
    super();
    this.text = truncateText(
      String(value),
      AgendaStashConfig.AgendaMaxTextWidth,
      AgendaStashConfig.AgendaMaxTextHeight
    );
    this._width = Math.min(
      AgendaStashConfig.AgendaItemTextPadding * 2 +
        getTextWidth(
          this.text,
          `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`
        ),
      AgendaStashConfig.AgendaItemWidth
    );
    this._height =
      AgendaStashConfig.StashMaxTextHeight + AgendaStashConfig.AgendaItemTextPadding * 2;
    this._x = AgendaStashConfig.StashPosX + stackHeightWidth;
    this._y = AgendaStashConfig.StashPosY;
    if (arrowTo) {
      this.arrow = new ArrowFromStashItemComponent(this).to(arrowTo) as ArrowFromStashItemComponent;
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
  };

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
