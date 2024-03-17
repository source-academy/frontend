import React from 'react';

import { CompactConfig } from '../../CseMachineCompactConfig';
import { Layout } from '../../CseMachineLayout';
import { CompactReferenceType, Data } from '../../CseMachineTypes';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayUnit } from '../ArrayUnit';
import { Binding } from '../Binding';
import { PrimitiveValue } from './PrimitiveValue';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value {
  /** array of units this array is made of */
  units: ArrayUnit[] = [];

  constructor(
    /** underlying values this array contains */
    readonly data: Data[],
    /** what this value is being referenced by */
    readonly referencedBy: CompactReferenceType[]
  ) {
    super();
    Layout.memoizeCompactValue(this);

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x = mainReference.frame.x() + mainReference.frame.width() + CompactConfig.FrameMarginX;
      this._y = mainReference.y();
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + CompactConfig.DataUnitWidth * 2;
        this._y = mainReference.y();
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + CompactConfig.DataUnitHeight;
      }
    }

    this._width = this.data.length * CompactConfig.DataUnitWidth + CompactConfig.DataMinWidth;
    this._height = CompactConfig.DataUnitHeight;

    // initialize array units from the last index
    for (let i = this.data.length - 1; i >= 0; i--) {
      const unit = new ArrayUnit(i, this.data[i], this);

      // update the dimensions, so that children array values can derive their coordinates
      // from these intermediate dimensions

      // update the width
      this._width = Math.max(
        this.width(),
        unit.value.width() +
          (!(unit.value instanceof PrimitiveValue) && i === this.data.length - 1
            ? (i + 1) * CompactConfig.DataUnitWidth + CompactConfig.DataUnitWidth
            : i * CompactConfig.DataUnitWidth)
      );

      // update the height
      this._height = Math.max(
        this._height,
        unit.value instanceof PrimitiveValue || unit.isMainReference
          ? CompactConfig.DataUnitHeight
          : unit.value.y() + unit.value.height() - unit.y()
      );

      this.units = [unit, ...this.units];
    }
  }
  reset(): void {
    super.reset();
    this.units.map(x => x.reset());
    this.referencedBy.length = 0;
  }
  updatePosition(): void {}

  draw(): React.ReactNode {
    if (this.isDrawn()) return null;
    this._isDrawn = true;
    return (
      <React.Fragment key={Layout.key++}>
        {this.units.length > 0
          ? this.units.map(unit => unit.draw())
          : new ArrayEmptyUnit(this).draw()}
      </React.Fragment>
    );
  }
}
