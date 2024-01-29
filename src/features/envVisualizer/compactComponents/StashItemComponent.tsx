import { KonvaEventObject } from 'konva/lib/Node';
import { Easings } from 'konva/lib/Tween';
import React, { RefObject } from 'react';
import { Label, Tag, Text } from 'react-konva';

import { FnValue } from '../components/values/FnValue';
import { GlobalFnValue } from '../components/values/GlobalFnValue';
import { Visible } from '../components/Visible';
import { ControlStashConfig, ShapeDefaultProps } from '../EnvVisualizerControlStash';
import { Layout } from '../EnvVisualizerLayout';
import { IHoverable } from '../EnvVisualizerTypes';
import {
  getTextWidth,
  isArray,
  isFn,
  isNumber,
  isStashItemInDanger,
  setHoveredCursor,
  setHoveredStyle,
  setUnhoveredCursor,
  setUnhoveredStyle,
  stackItemSAColor,
  truncateText
} from '../EnvVisualizerUtils';
import { ArrowFromStashItemComponent } from './arrows/ArrowFromStashItemComponent';
import { ArrayValue } from './values/ArrayValue';

export class StashItemComponent extends Visible implements IHoverable {
  /** text to display */
  readonly text: string;
  /** text to display on hover */
  readonly tooltip: string;
  readonly tooltipRef: RefObject<any>;
  readonly shapeRef: RefObject<any>;
  readonly textRef: RefObject<any>;
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
        : isFn(val)
        ? 'closure'
        : isArray(val)
        ? arrowTo
          ? 'pair/array'
          : JSON.stringify(val)
        : String(value);
    };
    this.text = truncateText(
      valToStashRep(value),
      ControlStashConfig.StashMaxTextWidth,
      ControlStashConfig.StashMaxTextHeight
    ).replace(/[\r\n]/gm, ' ');
    this.tooltip = valToStashRep(value);
    this.tooltipRef = React.createRef();
    this.shapeRef = React.createRef();
    this.textRef = React.createRef();
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
      this.arrow = new ArrowFromStashItemComponent(this).to(arrowTo) as ArrowFromStashItemComponent;
    }
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    !isStashItemInDanger(this.index) && setHoveredStyle(e.currentTarget);
    setHoveredCursor(e.currentTarget);
    this.tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    !isStashItemInDanger(this.index) && setUnhoveredStyle(e.currentTarget);
    setUnhoveredCursor(e.currentTarget);
    this.tooltipRef.current.hide();
  };

  destroy() {
    this.ref.current.destroyChildren();
  }

  draw(): React.ReactNode {
    const textProps = {
      fill: ControlStashConfig.SA_WHITE.toString(),
      padding: Number(ControlStashConfig.StashItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };
    const tagProps = {
      stroke: stackItemSAColor(this.index),
      cornerRadius: Number(ControlStashConfig.StashItemCornerRadius)
    };
    return (
      <React.Fragment key={Layout.key++}>
        <Label
          ref = {this.shapeRef}
          x={this.x()}
          y={this.y()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <Tag {...ShapeDefaultProps} {...tagProps} />
          <Text {...ShapeDefaultProps} {...textProps} ref={this.textRef} text={this.text} />
        </Label>
        <Label
          x={this.x() + ControlStashConfig.TooltipMargin}
          y={this.y() + this.height() + ControlStashConfig.TooltipMargin}
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

  async animate() {
    const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));
    if (isNumber(this.value)) {
      this.shapeRef.current.to({
        opacity: 0,
        duration: 0
      })
      await delay(100);

      this.shapeRef.current.to({
        opacity: 1,
        easing: Easings.StrongEaseInOut,
        duration: 1.5
      })
    }
  }
}
