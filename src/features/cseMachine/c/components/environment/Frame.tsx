import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import { Group, Label, Rect, Tag, Text as KonvaText } from 'react-konva';
import { StackFrame } from 'src/ctowasm/dist';

import { Visible } from '../../../components/Visible';
import { IHoverable } from '../../../CseMachineTypes';
import { defaultTextColor, setHoveredCursor, setUnhoveredCursor } from '../../../CseMachineUtils';
import { Arrow } from '../../../java/components/Arrow';
import { Method } from '../../../java/components/Method';
import { CControlStashMemoryConfig } from '../../config/CControlStashMemoryConfig';
import { CConfig, ShapeDefaultProps } from '../../config/CCSEMachineConfig';
import { CseMachine } from '../../CseMachine';
import { Binding } from '../ui/Binding';
import { Text } from '../ui/Text';

export class Frame extends Visible implements IHoverable {
  readonly tooltipRef: RefObject<any>;

  readonly bindings: Binding[] = [];
  readonly name: Text;
  private parent: Frame | undefined;

  constructor(
    readonly frame: StackFrame,
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

    this.name = new Text(frame.functionName, this._x + CConfig.FramePaddingX, this._y);

    this._width = Math.max(CConfig.FrameMinWidth, this.name.width() + 2 * CConfig.FramePaddingX);
    this._height = CConfig.FramePaddingY + this.name.height();

    // Create binding for each key-value pair
    let bindingY: number = this._y + this.name.height() + CConfig.FramePaddingY;
    for (const [key, data] of frame.variablesMap) {
      const currBinding: Binding = new Binding(
        key,
        data.value || 0,
        this._x + CConfig.FramePaddingX,
        bindingY
      );
      this.bindings.push(currBinding);
      bindingY += currBinding.height() + CConfig.FramePaddingY;
      this._width = Math.max(this._width, currBinding.width() + 2 * CConfig.FramePaddingX);
      this._height += currBinding.height() + CConfig.FramePaddingY;
    }

    // Set x of Method aft knowing frame width.
    this.bindings
      .filter(b => b.value instanceof Method)
      .forEach(b => {
        (b.value as Method).setX(this._x + this._width + CConfig.FramePaddingX);
        b.setArrowToX(this._x + this._width + CConfig.FramePaddingX);
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
      padding: Number(CControlStashMemoryConfig.ControlItemTextPadding),
      fontFamily: CControlStashMemoryConfig.FontFamily.toString(),
      fontSize: Number(CControlStashMemoryConfig.FontSize),
      fontStyle: CControlStashMemoryConfig.FontStyle.toString(),
      fontVariant: CControlStashMemoryConfig.FontVariant.toString()
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
          cornerRadius={Number(CConfig.FrameCornerRadius)}
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
            this._x + CConfig.FramePaddingX / 2,
            this._y + this.name.height(),
            this.parent.x() + CConfig.FramePaddingX / 2,
            // TODO WHY NEED TO ADD NAME HEIGHT?
            this.parent.y() + this.parent.height() + this.name?.height()
          ).draw()}

        {/* Frame tooltip */}
        {this.tooltip && (
          <Label
            x={this.x() + this.width() + CControlStashMemoryConfig.TooltipMargin}
            y={this.y() + CControlStashMemoryConfig.TooltipMargin}
            visible={false}
            ref={this.tooltipRef}
            key={CseMachine.key++}
          >
            <Tag
              {...ShapeDefaultProps}
              stroke="black"
              fill={'black'}
              opacity={Number(CControlStashMemoryConfig.TooltipOpacity)}
              key={CseMachine.key++}
            />
            <KonvaText
              {...ShapeDefaultProps}
              {...textProps}
              text={this.tooltip}
              padding={Number(CControlStashMemoryConfig.TooltipPadding)}
              key={CseMachine.key++}
            />
          </Label>
        )}
      </Group>
    );
  }
}
