import React from 'react';

import { Config } from '../../../../EnvVisualizerConfig';
import { Layout } from '../../../../EnvVisualizerLayout';
import { Data, ReferenceType } from '../../../../EnvVisualizerTypes';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayUnit } from '../ArrayUnit';
import { Binding } from '../Binding';
import { PrimitiveValue } from './PrimitiveValue';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  /** check if the value is already drawn */
  private isDrawn: boolean = false;
  /** array of units this array is made of */
  units: ArrayUnit[] = [];

  constructor(
    /** underlying values this array contains */
    readonly data: Data[],
    /** what this value is being referenced by */
    readonly referencedBy: ReferenceType[]
  ) {
    super();
    Layout.memoizeValue(this);

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this.x = mainReference.frame.x + mainReference.frame.width + Config.FrameMarginX;
      this.y = mainReference.y;
    } else {
      if (mainReference.isLastUnit) {
        this.x = mainReference.x + Config.DataUnitWidth * 2;
        this.y = mainReference.y;
      } else {
        this.x = mainReference.x;
        this.y = mainReference.y + mainReference.parent.height + Config.DataUnitHeight;
      }
    }

    this.width = this.data.length * Config.DataUnitWidth + Config.DataMinWidth;
    this.height = Config.DataUnitHeight;

    // initialize array units from the last index
    for (let i = this.data.length - 1; i >= 0; i--) {
      const unit = new ArrayUnit(i, this.data[i], this);

      // update the dimensions, so that children array values can derive their coordinates
      // from these intermediate dimensions

      // update the width
      this.width = Math.max(
        this.width,
        unit.value.width +
          (!(unit.value instanceof PrimitiveValue) && i === this.data.length - 1
            ? (i + 1) * Config.DataUnitWidth + Config.DataUnitWidth
            : i * Config.DataUnitWidth)
      );

      // update the height
      this.height = Math.max(
        this.height,
        unit.value instanceof PrimitiveValue || unit.isMainReference
          ? Config.DataUnitHeight
          : unit.value.y + unit.value.height - unit.y
      );

      this.units = [unit, ...this.units];
    }
  }

  draw(): React.ReactNode {
    if (this.isDrawn) return null;
    this.isDrawn = true;
    return (
      <React.Fragment key={Layout.key++}>
        {this.units.length > 0
          ? this.units.map(unit => unit.draw())
          : new ArrayEmptyUnit(this).draw()}
      </React.Fragment>
    );
  }
}
