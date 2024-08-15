import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Label, Tag, Text } from 'react-konva';

import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { ControlStashConfig } from '../CseMachineControlStashConfig';
import { Layout } from '../CseMachineLayout';
import { IHoverable } from '../CseMachineTypes';
import {
  defaultDangerColor,
  defaultStrokeColor,
  defaultTextColor,
  getTextWidth,
  isDataArray,
  isNonGlobalFn,
  isSourceObject,
  isStashItemInDanger,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  truncateText
} from '../CseMachineUtils';
import { ArrowFromStashItemComponent } from './arrows/ArrowFromStashItemComponent';
import { ArrayValue } from './values/ArrayValue';
import { Visible } from './Visible';

export class StashItemComponent extends Visible implements IHoverable {
  /** text to display */
  readonly text: string;
  /** text to display on hover */
  readonly tooltip: string;
  readonly tooltipRef: RefObject<any>;
  readonly arrow?: ArrowFromStashItemComponent;

  constructor(
    readonly value: any,
    /** The width of the stack so far */
    stackWidth: number,
    /** The index number of this stack item */
    readonly index: number,
    arrowTo?: FnValue | GlobalFnValue | ArrayValue
  ) {
    super();
    const valToStashRep = (val: any): string => {
      return typeof val === 'string'
        ? `'${val}'`.trim()
        : isNonGlobalFn(val)
          ? 'closure'
          : isDataArray(val)
            ? arrowTo
              ? 'pair/array'
              : JSON.stringify(val)
            : isSourceObject(val)
              ? val.toReplString()
              : String(value);
    };
    this.text = truncateText(
      valToStashRep(value),
      ControlStashConfig.StashMaxTextWidth,
      ControlStashConfig.StashMaxTextHeight
    ).replace(/[\r\n]/gm, ' ');
    this.tooltip = valToStashRep(value);
    this.tooltipRef = React.createRef();
    this._width =
      ControlStashConfig.StashItemTextPadding * 2 +
      getTextWidth(
        this.text,
        `${ControlStashConfig.FontStyle} ${ControlStashConfig.FontSize}px ${ControlStashConfig.FontFamily}`
      );
    this._height = ControlStashConfig.StashItemHeight + ControlStashConfig.StashItemTextPadding * 2;
    this._x = ControlStashConfig.StashPosX + stackWidth;
    this._y = ControlStashConfig.StashPosY;
    if (arrowTo) {
      arrowTo.markAsReferenced();
      this.arrow = new ArrowFromStashItemComponent(this).to(arrowTo) as ArrowFromStashItemComponent;
    }
  }

  // Save previous z-index to go back to later
  private zIndex = 0;
  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    if (!isStashItemInDanger(this.index)) {
      setHoveredStyle(e.currentTarget);
    }
    setHoveredCursor(e.currentTarget);
    this.zIndex = this.ref.current.zIndex();
    this.ref.current.moveToTop();
    this.tooltipRef.current.moveToTop();
    this.tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    setUnhoveredCursor(e.currentTarget);
    this.tooltipRef.current.hide();
    if (!isStashItemInDanger(this.index)) {
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
      padding: ControlStashConfig.StashItemTextPadding,
      fontFamily: ControlStashConfig.FontFamily,
      fontSize: ControlStashConfig.FontSize,
      fontStyle: ControlStashConfig.FontStyle,
      fontVariant: ControlStashConfig.FontVariant
    };
    const tagProps = {
      stroke: isStashItemInDanger(this.index) ? defaultDangerColor() : defaultStrokeColor(),
      cornerRadius: ControlStashConfig.StashItemCornerRadius
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
          <Text {...ShapeDefaultProps} {...textProps} text={this.text} />
        </Label>
        <Label
          x={this.x() + ControlStashConfig.TooltipMargin}
          y={this.y() + this.height() + ControlStashConfig.TooltipMargin}
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
