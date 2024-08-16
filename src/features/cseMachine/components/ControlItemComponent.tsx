import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';
import { Label, Tag, Text } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import {
  defaultActiveColor,
  defaultStrokeColor,
  defaultTextColor,
  getTextHeight,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../CseMachineUtils';
import { ArrowFromControlItemComponent } from './arrows/ArrowFromControlItemComponent';
import { Frame } from './Frame';
import { Visible } from './Visible';

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

  // Save previous z-index to go back to later
  private zIndex = 0;
  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    this.highlightOnHover();
    if (!this.topItem) {
      setHoveredStyle(e.currentTarget);
    }
    setHoveredCursor(e.currentTarget);
    this.zIndex = this.ref.current.zIndex();
    this.ref.current.moveToTop();
    this.tooltipRef.current.moveToTop();
    this.tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    this.unhighlightOnHover?.();
    setUnhoveredCursor(e.currentTarget);
    this.tooltipRef.current.hide();
    if (!this.topItem) {
      setUnhoveredStyle(e.currentTarget);
    }
    this.ref.current.zIndex(this.zIndex);
  };

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: defaultTextColor(),
      padding: ControlStashConfig.ControlItemTextPadding,
      fontFamily: ControlStashConfig.FontFamily,
      fontSize: ControlStashConfig.FontSize,
      fontStyle: ControlStashConfig.FontStyle,
      fontVariant: ControlStashConfig.FontVariant
    };
    const tagProps = {
      stroke: this.topItem ? defaultActiveColor() : defaultStrokeColor(),
      cornerRadius: ControlStashConfig.ControlItemCornerRadius
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
            stroke={Config.HoverBgColor}
            fill={Config.HoverBgColor}
            opacity={ControlStashConfig.TooltipOpacity}
          />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            fill={CseMachine.getPrintableMode() ? Config.PrintBgColor : Config.TextColor}
            text={this.tooltip}
            padding={ControlStashConfig.TooltipPadding}
          />
        </Label>
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
