import { astToString, ECE } from 'java-slang';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Circle, Group, Label, Tag, Text } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { IHoverable } from '../../CseMachineTypes';
import {
  defaultStrokeColor,
  defaultTextColor,
  getTextHeight,
  getTextWidth,
  setHoveredCursor,
  setUnhoveredCursor
} from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';

export class Method extends Visible implements IHoverable {
  private _centerX: number;

  private readonly _tooltipRef: RefObject<any>;
  private readonly _tooltip: string;

  constructor(
    x: number,
    y: number,
    private readonly _method: ECE.Closure
  ) {
    super();

    // Position.
    this._x = x;
    this._y = y;

    // Circle.
    this._centerX = this._x + Config.FnRadius * 2;

    // Tooltip.
    this._tooltipRef = React.createRef();
    this._tooltip = astToString(this._method.mtdOrCon);
  }

  get method() {
    return this._method;
  }

  setX(x: number) {
    this._x = x;
    this._centerX = this._x + Config.FnRadius * 2;
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    setHoveredCursor(e.currentTarget);
    this._tooltipRef.current.show();
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    setUnhoveredCursor(e.currentTarget);
    this._tooltipRef.current.hide();
  };

  draw(): React.ReactNode {
    return (
      <React.Fragment key={CseMachine.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          // ref={this.ref}
          key={CseMachine.key++}
        >
          {/* Left outer */}
          <Circle
            {...ShapeDefaultProps}
            key={CseMachine.key++}
            x={this._centerX - Config.FnRadius}
            y={this.y()}
            radius={Config.FnRadius}
            stroke={defaultStrokeColor()}
          />
          {/* Left inner */}
          <Circle
            {...ShapeDefaultProps}
            key={CseMachine.key++}
            x={this._centerX - Config.FnRadius}
            y={this.y()}
            radius={Config.FnInnerRadius}
            fill={defaultStrokeColor()}
          />
        </Group>

        {/* Tooltip */}
        <Label
          x={this.x() + Config.FnRadius * 2 + Config.TextPaddingX * 2}
          y={this.y() - getTextHeight(this._tooltip, getTextWidth(this._tooltip)) / 2}
          visible={false}
          ref={this._tooltipRef}
          key={CseMachine.key++}
        >
          <Tag
            stroke="black"
            fill={'black'}
            opacity={Config.FnTooltipOpacity}
            key={CseMachine.key++}
          />
          <Text
            text={this._tooltip}
            fontFamily={ControlStashConfig.FontFamily}
            fontSize={ControlStashConfig.FontSize}
            fontStyle={ControlStashConfig.FontStyle}
            fill={defaultTextColor()}
            padding={5}
            key={CseMachine.key++}
          />
        </Label>
      </React.Fragment>
    );
  }
}
