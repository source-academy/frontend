import React from 'react';
import { Group } from 'react-konva';

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
  private _isDrawn: boolean = false;

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
  isDrawn(): boolean {
    return this._isDrawn;
  }
  reset(): void {
    this._isDrawn = false;
    this.units.map(x => x.reset());
    this.referencedBy.length = 0;
  }

  setLevel(arrLevel: ArrayLevel): void {
    this.level = arrLevel;
  }

  updatePosition(pos: { x: number; y: number } = { x: -1, y: -1 }): void {
    this._x = pos.x > 0 ? pos.x : this._x;
    this._y = pos.y > 0 ? pos.y : this._y;
    this.units.forEach(unit => {
      unit.updatePosition();
    });
  }

  draw(): React.ReactNode {
    if (this.isDrawn()) {
      return null;
    }
    this._isDrawn = true;
    return (
      <Group key={Layout.key++}>
        {this.referencedBy.map(x => x instanceof Binding && Arrow.from(x.key).to(this).draw())}
        {this.units.length > 0
          ? this.units.map(unit => unit.draw())
          : new ArrayEmptyUnit(this).draw()}
      </Group>
    );
  }
}
