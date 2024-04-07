import React from 'react';

import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { DataArray, ReferenceType } from '../../CseMachineTypes';
import { isDummyReference, isMainReference } from '../../CseMachineUtils';
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
  get unreferenced() {
    return super.unreferenced;
  }
  set unreferenced(value: boolean) {
    if (value === super.unreferenced) return;
    super.unreferenced = value;
    for (const unit of this.units) {
      unit.unreferenced = value;
    }
  }

  constructor(
    /** underlying values this array contains */
    readonly data: DataArray,
    /** what this value is being referenced by */
    firstReference: ReferenceType
  ) {
    super();
    this.unreferenced = isDummyReference(firstReference);
    this.addReference(firstReference);
  }

  handleNewReference(newReference: ReferenceType): void {
    if (this.unreferenced) this.unreferenced = isDummyReference(newReference);
    if (!isMainReference(this, newReference)) return;

    // derive the coordinates from the main reference (binding / array unit)
    if (newReference instanceof Binding) {
      this._x = newReference.frame.x() + newReference.frame.width() + Config.FrameMarginX;
      this._y = newReference.y();
    } else {
      if (newReference.isLastUnit) {
        this._x = newReference.x() + Config.DataUnitWidth * 2;
        this._y = newReference.y();
      } else {
        this._x = newReference.x();
        this._y = newReference.y() + newReference.parent.height() + Config.DataUnitHeight;
      }
    }

    this._width = this.data.length * Config.DataUnitWidth + Config.DataMinWidth;
    this._height = Config.DataUnitHeight;

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
            ? (i + 1) * Config.DataUnitWidth + Config.DataUnitWidth
            : i * Config.DataUnitWidth)
      );

      // update the height
      this._height = Math.max(
        this._height,
        unit.value instanceof PrimitiveValue || unit.isMainReference
          ? Config.DataUnitHeight
          : unit.value.y() + unit.value.height() - unit.y()
      );

      this.units = [unit, ...this.units];
    }
  }

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
