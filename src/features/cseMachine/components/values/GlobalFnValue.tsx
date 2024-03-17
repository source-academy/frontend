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
import { ReferenceType } from '../../CseMachineTypes';
import { getBodyText, getParamsText, getTextWidth } from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { GenericArrow } from '../arrows/GenericArrow';
import { Binding } from '../Binding';
import { Frame } from '../Frame';
import { FnValue } from './FnValue';
import { Value } from './Value';

/** this encapsulates a function from the global frame
 * (which has no extra props such as environment or fnName) */
export class GlobalFnValue extends Value {
  centerX: number;
  readonly tooltipWidth: number;
  readonly exportTooltipWidth: number;
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;
  private _arrow: GenericArrow<FnValue | GlobalFnValue, Frame> | undefined;

  readonly paramsText: string;
  readonly bodyText: string;
  readonly exportBodyText: string;
  readonly tooltip: string;
  readonly exportTooltip: string;
  private selected: boolean = false;

  readonly ref: RefObject<any> = React.createRef();
  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying function */
    readonly data: () => any,
    /** what this value is being referenced by */
    readonly referencedBy: ReferenceType[]
  ) {
    super();
    Layout.memoizeValue(this);

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX / 4;
      this._y = mainReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;

    this._width = this.radius * 4;
    this._height = this.radius * 2;

    this.paramsText = `params: ${getParamsText(this.data)}`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
    this.exportBodyText =
      (this.bodyText.length > 23 ? this.bodyText.slice(0, 20) : this.bodyText)
        .split('\n')
        .slice(0, 2)
        .join('\n') + ' ...';
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.exportTooltip = `${this.paramsText}\n${this.exportBodyText}`;
    this.tooltipWidth =
      Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText)) + Config.TextPaddingX;
    this.exportTooltipWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.exportBodyText)
    );
  }

  isSelected(): boolean {
    return this.selected;
  }
  arrow(): GenericArrow<FnValue | GlobalFnValue, Frame> | undefined {
    return this._arrow;
  }

  updatePosition(): void {
    const mainReference = this.referencedBy.find(x => x instanceof Binding) || this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX / 4;
      this._y = mainReference.y();
      this.centerX = this._x + this.radius * 2;
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y() + Config.DataUnitHeight / 2 - this.radius;
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
      this.centerX = this._x + Config.DataUnitWidth / 2;
      this._x = this.centerX - this.radius * 2;
    }
    this._y += this.radius;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.labelRef.current.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      const container = currentTarget.getStage()?.container();
      container && (container.style.cursor = 'default');
    }
  };
  onClick = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.selected = !this.selected;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      this.labelRef.current.show();
    }
  };

  draw(): React.ReactNode {
    this._isDrawn = true;
    this._arrow =
      Layout.globalEnvNode.frame && new ArrowFromFn(this).to(Layout.globalEnvNode.frame);
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          onClick={e => this.onClick(e)}
          ref={this.ref}
        >
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={
              CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
            }
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={
              CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
            }
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={
              CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
            }
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={
              CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
            }
          />
        </Group>
        {CseMachine.getPrintableMode() ? (
          <KonvaLabel
            x={this.x() + this.width() + Config.TextPaddingX * 2}
            y={this.y() - Config.TextPaddingY}
            visible={true}
            ref={this.labelRef}
          >
            <KonvaTag stroke="black" fill={'white'} opacity={Number(Config.FnTooltipOpacity)} />
            <KonvaText
              text={this.exportTooltip}
              fontFamily={Config.FontFamily.toString()}
              fontSize={Number(Config.FontSize)}
              fontStyle={Config.FontStyle.toString()}
              fill={Config.SA_BLUE.toString()}
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
            <KonvaTag stroke="black" fill={'black'} opacity={Number(Config.FnTooltipOpacity)} />
            <KonvaText
              text={this.tooltip}
              fontFamily={Config.FontFamily.toString()}
              fontSize={Number(Config.FontSize)}
              fontStyle={Config.FontStyle.toString()}
              fill={Config.SA_WHITE.toString()}
              padding={5}
            />
          </KonvaLabel>
        )}
        {this._arrow?.draw()}
      </React.Fragment>
    );
  }
}
