import { ECE } from 'java-slang';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Label, Rect, Tag, Text as KonvaText } from 'react-konva';

import { Visible } from '../../components/Visible';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { ControlStashConfig } from '../../CseMachineControlStashConfig';
import { IHoverable } from '../../CseMachineTypes';
import { defaultTextColor, setHoveredCursor, setUnhoveredCursor } from '../../CseMachineUtils';
import { CseMachine } from '../CseMachine';
import { Arrow } from './Arrow';
import { Binding } from './Binding';
import { Method } from './Method';
import { Text } from './Text';

export class Frame extends Visible implements IHoverable {
  readonly tooltipRef: RefObject<any>;

  readonly bindings: Binding[] = [];
  readonly name: Text;
  private parent: Frame | undefined;

  constructor(
    readonly frame: ECE.EnvNode,
    x: number,
    y: number,
    readonly stroke: string,

    readonly tooltip?: string,
    readonly highlightOnHover?: () => void,
    readonly unhighlightOnHover?: () => void
  ) {
    super();

    this._x = x;
    this._y = y;

    this.name = new Text(frame.name, this._x + Config.FramePaddingX, this._y);

    this._width = Math.max(Config.FrameMinWidth, this.name.width() + 2 * Config.FramePaddingX);
    this._height = Config.FramePaddingY + this.name.height();

    // Create binding for each key-value pair
    let bindingY: number = this._y + this.name.height() + Config.FramePaddingY;
    for (const [key, data] of frame.frame) {
      const currBinding: Binding = new Binding(key, data, this._x + Config.FramePaddingX, bindingY);
      this.bindings.push(currBinding);
      bindingY += currBinding.height() + Config.FramePaddingY;
      this._width = Math.max(this._width, currBinding.width() + 2 * Config.FramePaddingX);
      this._height += currBinding.height() + Config.FramePaddingY;
    }

    // Set x of Method aft knowing frame width.
    this.bindings
      .filter(b => b.value instanceof Method)
      .forEach(b => {
        (b.value as Method).setX(this._x + this._width + Config.FramePaddingX);
        b.setArrowToX(this._x + this._width + Config.FramePaddingX);
      });

    this.tooltipRef = React.createRef();
  }

  setWidth(width: number) {
    this._width = width;
  }

  setParent(parent: Frame) {
    this.parent = parent;
  }

  onMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    this.highlightOnHover?.();
    if (this.tooltip || this.highlightOnHover) {
      setHoveredCursor(e.currentTarget);
    }
    if (this.tooltip) {
      this.tooltipRef.current.show();
    }
  };

  onMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
    this.unhighlightOnHover?.();
    if (this.tooltip || this.unhighlightOnHover) {
      setUnhoveredCursor(e.currentTarget);
    }
    if (this.tooltip) {
      this.tooltipRef.current.hide();
    }
  };

  draw(): React.ReactNode {
    const textProps = {
      fill: defaultTextColor(),
      padding: Number(ControlStashConfig.ControlItemTextPadding),
      fontFamily: ControlStashConfig.FontFamily.toString(),
      fontSize: Number(ControlStashConfig.FontSize),
      fontStyle: ControlStashConfig.FontStyle.toString(),
      fontVariant: ControlStashConfig.FontVariant.toString()
    };

    return (
      <Group key={CseMachine.key++}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y() + this.name.height()}
          width={this.width()}
          height={this.height()}
          stroke={this.stroke}
          cornerRadius={Number(Config.FrameCornerRadius)}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          key={CseMachine.key++}
        />
        {/* Frame name */}
        {this.name.draw()}

        {/* Frame */}
        {this.bindings.map(binding => binding.draw())}

        {/* Frame parent */}
        {this.parent &&
          new Arrow(
            this._x + Config.FramePaddingX / 2,
            this._y + this.name.height(),
            this.parent.x() + Config.FramePaddingX / 2,
            // TODO WHY NEED TO ADD NAME HEIGHT?
            this.parent.y() + this.parent.height() + this.name?.height()
          ).draw()}

        {/* Frame tooltip */}
        {this.tooltip && (
          <Label
            x={this.x() + this.width() + ControlStashConfig.TooltipMargin}
            y={this.y() + ControlStashConfig.TooltipMargin}
            visible={false}
            ref={this.tooltipRef}
            key={CseMachine.key++}
          >
            <Tag
              {...ShapeDefaultProps}
              stroke="black"
              fill={'black'}
              opacity={Number(ControlStashConfig.TooltipOpacity)}
              key={CseMachine.key++}
            />
            <KonvaText
              {...ShapeDefaultProps}
              {...textProps}
              text={this.tooltip}
              padding={Number(ControlStashConfig.TooltipPadding)}
              key={CseMachine.key++}
            />
          </Label>
        )}
      </Group>
    );
  }
}
