import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import { Visible } from '../components/Visible';
import { ControlStashConfig, ShapeDefaultProps } from '../CseMachineControlStash';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import {
  currentItemSAColor,
  getTextHeight,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../CseMachineUtils';
import { ArrowFromControlItemComponent } from './arrows/ArrowFromControlItemComponent';
import { Frame } from './Frame';

export class ControlItemComponent extends Visible implements IHoverable {
  /** text to display */
  readonly text: string;
  readonly tooltipRef: React.RefObject<any>;
  readonly arrow?: ArrowFromControlItemComponent;

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
      ControlStashConfig.ControlMaxTextWidth,
      ControlStashConfig.ControlMaxTextHeight
    );
    this.tooltipRef = React.createRef();
    this.highlightOnHover = highlightOnHover;
    this.unhighlightOnHover = unhighlightOnHover;
    this._x = ControlStashConfig.ControlPosX;
    this._y = ControlStashConfig.ControlPosY + stackHeight;
    this._width = ControlStashConfig.ControlItemWidth;
    this._height =
      getTextHeight(
        this.text,
        ControlStashConfig.ControlMaxTextWidth,
        `${ControlStashConfig.FontStyle} ${ControlStashConfig.FontSize}px ${ControlStashConfig.FontFamily}`,
        ControlStashConfig.FontSize
      ) +
      ControlStashConfig.ControlItemTextPadding * 2;
    if (arrowTo) {
      this.arrow = new ArrowFromControlItemComponent(this).to(
        arrowTo
      ) as ArrowFromControlItemComponent;
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
      fill: ControlStashConfig.SA_WHITE.toString(),
      padding: Number(ControlStashConfig.ControlItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    const tagProps = {
      stroke: currentItemSAColor(this.topItem),
      cornerRadius: Number(ControlStashConfig.ControlItemCornerRadius)
    };
    return (
      <React.Fragment key={Layout.key++}>
        <Label
          ref={this.ref}
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
          x={this.x() + this.width() + ControlStashConfig.TooltipMargin}
          y={this.y() + ControlStashConfig.TooltipMargin}
          visible={false}
          ref={this.tooltipRef}
        >
          <Tag
            {...ShapeDefaultProps}
            stroke="black"
            fill={'black'}
            opacity={Number(ControlStashConfig.TooltipOpacity)}
          />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            text={this.tooltip}
            padding={Number(ControlStashConfig.TooltipPadding)}
          />
        </Label>
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
