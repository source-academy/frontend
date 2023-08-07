import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { AgendaStashConfig, ShapeDefaultProps } from '../EnvVisualizerAgendaStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  currentItemSAColor,
  getTextHeight,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../EnvVisualizerUtils';
import { ArrowFromAgendaItemComponent } from './arrows/ArrowFromAgendaItemComponent';
import { Frame } from './Frame';

export class AgendaItemComponent extends Visible implements IHoverable {
  /** text to display */
  readonly text: string;
  readonly tooltipRef: RefObject<any>;
  readonly arrow?: ArrowFromAgendaItemComponent;

  constructor(
    readonly value: any,
    /** text to display on hover */
    readonly tooltip: string,
    /** The height of the stack so far */
    stackHeight: number,
    /** callback function to highlight editor lines on hover */
    readonly highlightOnHover: () => void,
    /** callback function to unhighlight editor lines after hover */
    readonly unhighlightOnHover: () => void,
    readonly topItem: boolean,
    arrowTo?: Frame
  ) {
    super();
    this.text = truncateText(
      String(value),
      AgendaStashConfig.AgendaMaxTextWidth,
      AgendaStashConfig.AgendaMaxTextHeight
    );
    this.tooltipRef = React.createRef();
    this.highlightOnHover = highlightOnHover;
    this.unhighlightOnHover = unhighlightOnHover;
    this._x = AgendaStashConfig.AgendaPosX;
    this._y = AgendaStashConfig.AgendaPosY + stackHeight;
    this._width = AgendaStashConfig.AgendaItemWidth;
    this._height =
      getTextHeight(
        this.text,
        AgendaStashConfig.AgendaMaxTextWidth,
        `${AgendaStashConfig.FontStyle} ${AgendaStashConfig.FontSize}px ${AgendaStashConfig.FontFamily}`,
        AgendaStashConfig.FontSize
      ) +
      AgendaStashConfig.AgendaItemTextPadding * 2;
    if (arrowTo) {
      this.arrow = new ArrowFromAgendaItemComponent(this).to(
        arrowTo
      ) as ArrowFromAgendaItemComponent;
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    this.highlightOnHover();
    !this.topItem && setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
    this.tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    this.unhighlightOnHover?.();
    !this.topItem && setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
    this.tooltipRef.current.hide();
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
      stroke: currentItemSAColor(this.topItem),
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
            text={this.text}
            width={this.width()}
            height={this.height()}
          />
        </Label>
        <Label
          x={this.x() + this.width() + AgendaStashConfig.TooltipMargin}
          y={this.y() + AgendaStashConfig.TooltipMargin}
          visible={false}
          ref={this.tooltipRef}
        >
          <Tag
            {...ShapeDefaultProps}
            stroke="black"
            fill={'black'}
            opacity={Number(AgendaStashConfig.TooltipOpacity)}
          />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            text={this.tooltip}
            padding={Number(AgendaStashConfig.TooltipPadding)}
          />
        </Label>
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
