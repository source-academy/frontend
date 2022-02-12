import React from 'react';

import { Config } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Data, ReferenceType } from '../../EnvVisualizerTypes';
import { ArrayEmptyUnit } from '../ArrayEmptyUnit';
import { ArrayLevel } from '../ArrayLevel';
import { ArrayUnit } from '../ArrayUnit';
import { Arrow } from '../arrows/Arrow';
import { Binding } from '../Binding';
// import { PrimitiveValue } from './PrimitiveValue';
import { Value } from './Value';

/** this class encapsulates an array value in source,
 *  defined as a JS array with not 2 elements */
export class ArrayValue extends Value {
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;

  /** check if the value is already drawn */
  private isDrawn: boolean = false;

  /** array of units this array is made of */
  units: ArrayUnit[] = [];
  level: ArrayLevel | undefined;

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
      this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX;
      this._y = mainReference.y();
    } else {
      if (mainReference.isLastUnit) {
        this._x = mainReference.x() + Config.DataUnitWidth * 2;
        this._y = mainReference.y();
      } else {
        this._x = mainReference.x();
        this._y = mainReference.y() + mainReference.parent.height() + Config.DataUnitHeight;
      }
    }

    this._width = this.data.length * Config.DataUnitWidth + Config.DataMinWidth;
    this._height = Config.DataUnitHeight;

    // initialize array units from the last index
    for (let i = this.data.length - 1; i >= 0; i--) {
      const unit = new ArrayUnit(i, this.data[i], this);

      // update the dimensions, so that children array values can derive their coordinates
      // from these intermediate dimensions

      // // update the width
      // this.width = Math.max(
      //   this.width,
      //   unit.value.width +
      //     (!(unit.value instanceof PrimitiveValue) && i === this.data.length - 1
      //       ? (i + 1) * Config.DataUnitWidth + Config.DataUnitWidth
      //       : i * Config.DataUnitWidth)
      // );

      // // update the height
      // this.height = Math.max(
      //   this.height,
      //   unit.value instanceof PrimitiveValue || unit.isMainReference
      //     ? Config.DataUnitHeight
      //     : unit.value.y + unit.value.height - unit.y
      // );

      this.units = [unit, ...this.units];
    }
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }

  setLevel(arrLevel : ArrayLevel): void {
    this.level = arrLevel;
  }

  updatePosition(pos: { x: number; y: number } = { x: -1, y: -1 }): void {
    // const mainReference = this.referencedBy[0];
    // if (mainReference instanceof Binding) {
    //   this.x = mainReference.frame.x + mainReference.frame.width + Config.FrameMarginX;
    //   this.y = mainReference.y;
    // } else {
    //   if (mainReference.isLastUnit) {
    //     this.x = mainReference.x + Config.DataUnitWidth * 2;
    //     this.y = mainReference.y;
    //   } else {
    //     this.x = mainReference.x;
    //     this.y = mainReference.y + mainReference.parent.height + Config.DataUnitHeight;
    //   }
    // }
    this._x = pos.x > 0 ? pos.x : this._x;
    this._y = pos.y > 0 ? pos.y : this._y;
    this.units.forEach(unit => {
      unit.updatePosition();
    });
  }

  draw(): React.ReactNode {
    if (this.isDrawn) {
      return null;
    }
    this.isDrawn = true;
    return (
      <React.Fragment key={Layout.key++}>
        {this.referencedBy.map(x => x instanceof Binding && Arrow.from(x.key).to(this).draw())}
        {this.units.length > 0
          ? this.units.map(unit => unit.draw())
          : new ArrayEmptyUnit(this).draw()}
      </React.Fragment>
    );
  }
}
