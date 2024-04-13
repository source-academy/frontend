import { Text, TextConfig } from 'konva/lib/shapes/Text';
import React from 'react';
import { Text as KonvaText } from 'react-konva';

import CseMachine from '../CseMachine';
import { Config, ShapeDefaultProps } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Data } from '../CseMachineTypes';
import {
  defaultStrokeColor,
  defaultTextColor,
  fadedStrokeColor,
  fadedTextColor
} from '../CseMachineUtils';
import { ArrowFromArrayUnit } from './arrows/ArrowFromArrayUnit';
import { GenericArrow } from './arrows/GenericArrow';
import { RoundedRect } from './shapes/RoundedRect';
import { defaultOptions } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { PrimitiveValue } from './values/PrimitiveValue';
import { Value } from './values/Value';
import { Visible } from './Visible';

/** this class encapsulates a single unit (box) of array to be rendered.
 *  this unit is part of an ArrayValue */
export class ArrayUnit extends Visible {
  readonly value: Value;

  /** check if this is the first unit in the array */
  readonly isFirstUnit: boolean;
  /** check if this is the last unit in the array */
  readonly isLastUnit: boolean;
  /** check if this unit is the main reference of the value */
  readonly isMainReference: boolean;
  /** arrow that is drawn from the array unit to the value */
  arrow?: GenericArrow<ArrayUnit, Value>;
  readonly indexRef = React.createRef<Text>();

  constructor(
    /** index of this unit in its parent */
    readonly idx: number,
    /** the value this unit contains*/
    readonly data: Data,
    /** parent of this unit */
    readonly parent: ArrayValue
  ) {
    super();
    this._x = this.parent.x() + this.idx * Config.DataUnitWidth;
    this._y = this.parent.y();
    this._height = Config.DataUnitHeight;
    this._width = Config.DataUnitWidth;
    this.isFirstUnit = this.idx === 0;
    this.isLastUnit = this.idx === this.parent.data.length - 1;
    this.value = Layout.createValue(this.data, this);
    this.isMainReference = this.value.references.length > 1;
  }

  showIndex() {
    this.indexRef.current?.show();
  }

  hideIndex() {
    if (!CseMachine.getPrintableMode()) this.indexRef.current?.hide();
  }

  draw(): React.ReactNode {
    if (this.isDrawn()) return null;
    this._isDrawn = true;

    if (!(this.value instanceof PrimitiveValue)) {
      this.arrow = new ArrowFromArrayUnit(this).to(this.value);
    }

    const cornerRadius = {
      upperLeft: 0,
      lowerLeft: 0,
      upperRight: 0,
      lowerRight: 0
    };

    if (this.isFirstUnit) cornerRadius.upperLeft = cornerRadius.lowerLeft = Config.DataCornerRadius;
    if (this.isLastUnit)
      cornerRadius.upperRight = cornerRadius.lowerRight = Config.DataCornerRadius;

    const indexProps: TextConfig = {
      fontFamily: defaultOptions.fontFamily,
      fontSize: defaultOptions.fontSize,
      fontStyle: defaultOptions.fontStyle,
      fill: this.parent.isReferenced() ? defaultTextColor() : fadedTextColor(),
      x: this.x(),
      y: this.y() - defaultOptions.fontSize - 4,
      width: this.width(),
      padding: 2,
      visible: CseMachine.getPrintableMode()
    };

    return (
      <React.Fragment key={Layout.key++}>
        <RoundedRect
          key={Layout.key++}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={this.parent.isReferenced() ? defaultStrokeColor() : fadedStrokeColor()}
          hitStrokeWidth={Config.DataHitStrokeWidth}
          fillEnabled={true}
          cornerRadius={cornerRadius}
          forwardRef={this.ref}
        />
        <KonvaText
          key={Layout.key++}
          ref={this.indexRef}
          {...ShapeDefaultProps}
          {...indexProps}
          text={`${this.idx}`}
        />
        {this.value.draw()}
        {this.arrow?.draw()}
      </React.Fragment>
    );
  }
}
