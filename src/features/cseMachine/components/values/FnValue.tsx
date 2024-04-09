import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { IHoverable, NonGlobalFn, ReferenceType } from '../../CseMachineTypes';
import {
  defaultSAColor,
  fadedSAColor,
  getBodyText,
  getParamsText,
  getTextWidth,
  isMainReference,
  isStreamFn
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { Value } from './Value';

/** this class encapsulates a JS Slang function (not from the global frame) that
 *  contains extra props such as environment and fnName */
export class FnValue extends Value implements IHoverable {
  /** name of this function */
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;
  tooltipWidth!: number;
  centerX!: number;

  fnName!: string;
  paramsText!: string;
  bodyText!: string;
  exportBodyText!: string;
  tooltip!: string;
  exportTooltip!: string;
  exportTooltipWidth!: number;
  private _arrow: ArrowFromFn | undefined;

  /** the enclosing frame of this fn value */
  enclosingFrame?: Frame;
  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying JS Slang function (contains extra props) */
    readonly data: NonGlobalFn,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    Layout.memoizeValue(data, this);
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

    this._width = this.radius * 4;
    this._height = this.radius * 2;

    this.enclosingFrame = Frame.getFrom(this.data.environment);
    this.fnName = isStreamFn(this.data) ? '' : this.data.functionName;

    this.paramsText = `params: ${getParamsText(this.data)}`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
    this.exportBodyText =
      (this.bodyText.length > 23 ? this.bodyText.slice(0, 20) : this.bodyText)
        .split('\n')
        .slice(0, 2)
        .join('\n') + ' ...';
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.exportTooltip = `${this.paramsText}\n${this.exportBodyText}`;
    this.tooltipWidth = Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText));
    this.exportTooltipWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.exportBodyText)
    );
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.ref.current.moveToTop();
    this.labelRef.current.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.labelRef.current.hide();
  };

  draw(): React.ReactNode {
    if (this.fnName === undefined) {
      throw new Error('Error: Closure has no main reference and is not initialised!');
    }
    if (this.enclosingFrame) {
      this._arrow = new ArrowFromFn(this).to(this.enclosingFrame) as ArrowFromFn;
    }
    const stroke = this.isReferenced() ? defaultSAColor() : fadedSAColor();
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          ref={this.ref}
        >
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={stroke}
          />
        </Group>
        {CseMachine.getPrintableMode() ? (
          <KonvaLabel
            x={this.x() + this.width() + Config.TextPaddingX * 2}
            y={this.y() - Config.TextPaddingY}
            visible={true}
            ref={this.labelRef}
          >
            <KonvaTag stroke="black" fill={'white'} opacity={Config.FnTooltipOpacity} />
            <KonvaText
              text={this.exportTooltip}
              fontFamily={Config.FontFamily}
              fontSize={Config.FontSize}
              fontStyle={Config.FontStyle}
              fill={Config.SA_BLUE}
              padding={5}
            />
          </KonvaLabel>
        ) : (
          <KonvaLabel
            x={this.x() + this.width() + Config.TextPaddingX * 2}
            y={this.y() - Config.TextPaddingY}
            visible={false}
            ref={this.labelRef}
          >
            <KonvaTag stroke="black" fill={'black'} opacity={Config.FnTooltipOpacity} />
            <KonvaText
              text={this.tooltip}
              fontFamily={Config.FontFamily}
              fontSize={Config.FontSize}
              fontStyle={Config.FontStyle}
              fill={Config.SA_WHITE}
              padding={5}
            />
          </KonvaLabel>
        )}
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
