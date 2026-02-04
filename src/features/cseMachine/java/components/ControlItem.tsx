import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Label, Tag, Text } from 'react-konva';

import { Visible } from '../../components/Visible';
import { ShapeDefaultProps } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { IHoverable } from '../../CseMachineTypes';
import {
  defaultActiveColor,
  defaultTextColor,
  getTextHeight,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { Arrow } from './Arrow';
import { Frame } from './Frame';

export class ControlItem extends Visible implements IHoverable {
  private readonly _arrow: Arrow | undefined;
  private readonly _tooltipRef: RefObject<any>;

  constructor(
    y: number,

    private readonly _text: string,
    private readonly _stroke: string,

    reference: Frame | undefined,

    private readonly _tooltip: string,
    private readonly highlightOnHover: () => void,
    private readonly unhighlightOnHover: () => void
  ) {
    super();

    // Position.
    this._x = ControlStashConfig.ControlPosX;
    this._y = y;

    // Text.
    this._text = truncateText(
      this._text,
      ControlStashConfig.ControlMaxTextWidth,
      ControlStashConfig.ControlMaxTextHeight
    );

    // Tooltip.
    this._tooltipRef = React.createRef();

    // Height and width.
    this._height =
      getTextHeight(this._text, ControlStashConfig.ControlMaxTextWidth) +
      ControlStashConfig.ControlItemTextPadding * 2;
    this._width = ControlStashConfig.ControlItemWidth;

    // Arrow
    if (reference) {
      this._arrow = new Arrow(
        this._x + this._width,
        this._y + this._height / 2,
        reference.x(),
        reference.y() + reference.height() / 2 + reference.name.height()
      );
    }
  }

  private isCurrentItem = (): boolean => {
    return this._stroke === defaultActiveColor();
  };

  onMouseEnter = (e: KonvaEventObject<MouseEvent>): void => {
    this.highlightOnHover();
    if (!this.isCurrentItem()) {
      setHoveredStyle(e.currentTarget);
    }
    setHoveredCursor(e.currentTarget);
    this._tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>): void => {
    this.unhighlightOnHover();
    if (!this.isCurrentItem()) {
      setUnhoveredStyle(e.currentTarget);
    }
    setUnhoveredCursor(e.currentTarget);
    this._tooltipRef.current.hide();
  };

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
      stroke: this._stroke,
      cornerRadius: ControlStashConfig.ControlItemCornerRadius
    };
    return (
      <React.Fragment key={CseMachine.key++}>
        {/* Text */}
        <Label
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={CseMachine.key++}
        >
          <Tag {...ShapeDefaultProps} {...tagProps} key={CseMachine.key++} />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            text={this._text}
            width={this.width()}
            height={this.height()}
            key={CseMachine.key++}
          />
        </Label>

        {/* Tooltip */}
        <Label
          x={this.x() + this.width() + ControlStashConfig.TooltipMargin}
          y={this.y() + ControlStashConfig.TooltipMargin}
          visible={false}
          ref={this._tooltipRef}
          key={CseMachine.key++}
        >
          <Tag
            {...ShapeDefaultProps}
            stroke="black"
            fill={'black'}
            opacity={ControlStashConfig.TooltipOpacity}
            key={CseMachine.key++}
          />
          <Text
            {...ShapeDefaultProps}
            {...textProps}
            text={this._tooltip}
            padding={ControlStashConfig.TooltipPadding}
            key={CseMachine.key++}
          />
        </Label>

        {/* Arrow */}
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
