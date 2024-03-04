import React from 'react';

import CseMachine from '../CseMachine';
import { Config } from '../CseMachineConfig';
import { Layout } from '../CseMachineLayout';
import { Data } from '../CseMachineTypes';
import { ArrowFromArrayUnit } from './arrows/ArrowFromArrayUnit';
import { GenericArrow } from './arrows/GenericArrow';
import { RoundedRect } from './shapes/RoundedRect';
import { ArrayValue } from './values/ArrayValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';
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
  /** check if the value is already drawn */

  parent: ArrayValue;
  arrow: GenericArrow<ArrayUnit, Value> | undefined = undefined;

  constructor(
    /** index of this unit in its parent */
    readonly idx: number,
    /** the value this unit contains*/
    readonly data: Data,
    /** parent of this unit */
    parent: ArrayValue
  ) {
    super();
    this.parent = parent;
    this._x = this.parent.x() + this.idx * Config.DataUnitWidth;
    this._y = this.parent.y();
    this._height = Config.DataUnitHeight;
    this._width = Config.DataUnitWidth;
    this.isFirstUnit = this.idx === 0;
    this.isLastUnit = this.idx === this.parent.data.length - 1;
    this.value = Layout.createValue(this.data, this);
    this.isMainReference = this.value.referencedBy.length > 1;
  }

  updatePosition = () => {
    this._x = this.parent.x() + this.idx * Config.DataUnitWidth;
    this._y = this.parent.y();
    this.value instanceof PrimitiveValue && this.value.updatePosition();
  };

  onMouseEnter = () => {};

  onMouseLeave = () => {};

  onClick = () => {
    this.parent.onClick();
  };

  draw(): React.ReactNode {
    if (this._isDrawn) return null;
    this._isDrawn = true;

    const cornerRadius = {
      upperLeft: 0,
      lowerLeft: 0,
      upperRight: 0,
      lowerRight: 0
    };

    if (this.isFirstUnit)
      cornerRadius.upperLeft = cornerRadius.lowerLeft = Number(Config.DataCornerRadius);
    if (this.isLastUnit)
      cornerRadius.upperRight = cornerRadius.lowerRight = Number(Config.DataCornerRadius);
    if (!(this.value instanceof PrimitiveValue)) {
      this.arrow = new ArrowFromArrayUnit(this).to(this.value);
      this.parent.addArrow(this.arrow);
      if (this.value instanceof ArrayValue) {
        this.value.addArrow(this.arrow);
      }
    }

    return (
      <React.Fragment key={Layout.key++}>
        <RoundedRect
          key={Layout.key++}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={
            CseMachine.getPrintableMode() ? Config.SA_BLUE.toString() : Config.SA_WHITE.toString()
          }
          hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
          fillEnabled={false}
          forwardRef={this.ref}
          cornerRadius={cornerRadius}
          onClick={this.onClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
        {!(this.value instanceof FnValue || this.value instanceof GlobalFnValue) &&
          this.value.draw()}
        {this.arrow && this.arrow.draw()}
      </React.Fragment>
    );
  }
}
