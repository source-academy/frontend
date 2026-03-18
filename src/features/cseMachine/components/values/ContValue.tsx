import { Control, Stash } from 'js-slang/dist/cse-machine/interpreter';
import { Environment } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/lib/Node';
import { Label } from 'konva/lib/shapes/Label';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Rect,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IHoverable, ReferenceType } from '../../CseMachineTypes';
import {
  defaultStrokeColor,
  defaultTextColor,
  fadedStrokeColor,
  fadedTextColor,
  getTextWidth,
  isMainReference,
  setHoveredCursor,
  setUnhoveredCursor
} from '../../CseMachineUtils';
import { Continuation } from '../../utils/scheme';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { Value } from './Value';

/** this class encapsulates a Scheme Continuation that
 *  contains extra props such as environment, control and stash */
export class ContValue extends Value implements IHoverable {
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;
  readonly labelRef: RefObject<Label> = React.createRef();

  readonly tooltip: string = 'continuation';
  readonly tooltipWidth: number = getTextWidth(this.tooltip);
  readonly exportTooltip: string = 'continuation';
  readonly exportTooltipWidth: number = getTextWidth(this.exportTooltip);

  centerX: number;
  enclosingFrame?: Frame;
  env: Environment;
  control: Control;
  stash: Stash;
  private _arrow: ArrowFromFn | undefined;

  constructor(
    /** underlying continuation */
    readonly data: Continuation,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    Layout.memoizeValue(data, this);

    this.centerX = 0;
    this._width = this.radius * 2.5;
    this._height = this.radius * 2.5;

    // get the proper environment from the continuation
    this.env = this.data.getEnv()[0];
    this.enclosingFrame = Frame.getFrom(this.env);
    this.control = this.data.getControl();
    this.stash = this.data.getStash();

    this.addReference(firstReference);
  }

  handleNewReference(newReference: ReferenceType): void {
    if (!isMainReference(this, newReference)) return;

    // derive the coordinates from the main reference (binding / array unit)
    if (newReference instanceof Binding) {
      this._x = newReference.frame.x() + newReference.frame.width() + Config.FrameMarginX;
      this._y = newReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (newReference.isLastUnit) {
        this._x = newReference.x() + Config.DataUnitWidth * 2;
        this._y = newReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = newReference.x();
        this._y = newReference.y() + newReference.parent.height() + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;
  }

  arrow(): ArrowFromFn | undefined {
    return this._arrow;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setHoveredCursor(currentTarget);
    this.labelRef.current?.moveToTop();
    this.labelRef.current?.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    setUnhoveredCursor(currentTarget);
    this.labelRef.current?.hide();
  };

  draw(): React.ReactNode {
    if (this.enclosingFrame) {
      this._arrow = new ArrowFromFn(this).to(this.enclosingFrame) as ArrowFromFn;
    }
    const textColor = this.isReferenced() ? defaultTextColor() : fadedTextColor();
    const strokeColor = this.isReferenced() ? defaultStrokeColor() : fadedStrokeColor();
    return (
      <React.Fragment key={Layout.key++}>
        <Group onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} ref={this.ref}>
          <Rect
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - 1.5 * this.radius}
            y={this.y() - this.radius}
            width={this.radius / 2}
            height={this.radius * 2}
            stroke={strokeColor}
          />
          <Rect
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y() - 1.5 * this.radius}
            width={this.radius * 2}
            height={this.radius / 2}
            stroke={strokeColor}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX}
            y={this.y()}
            radius={this.radius}
            stroke={strokeColor}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX}
            y={this.y()}
            radius={this.innerRadius}
            fill={strokeColor}
          />
        </Group>
        <KonvaLabel
          x={this.x() + this.width() + Config.TextPaddingX * 2}
          y={this.y() - Config.TextPaddingY}
          visible={CseMachine.getPrintableMode()}
          ref={this.labelRef}
        >
          {CseMachine.getPrintableMode() ? (
            <KonvaTag stroke={strokeColor} />
          ) : (
            <KonvaTag
              stroke={Config.HoverBgColor}
              fill={Config.HoverBgColor}
              opacity={Config.FnTooltipOpacity}
            />
          )}
          <KonvaText
            text={CseMachine.getPrintableMode() ? this.exportTooltip : this.tooltip}
            fontFamily={Config.FontFamily}
            fontSize={Config.FontSize}
            fontStyle={Config.FontStyle}
            fill={textColor}
            padding={5}
          />
        </KonvaLabel>
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
