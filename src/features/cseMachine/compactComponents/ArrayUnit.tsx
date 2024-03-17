import React from 'react';

import { RoundedRect } from '../components/shapes/RoundedRect';
import { Visible } from '../components/Visible';
import { CompactConfig } from '../CseMachineCompactConfig';
import { Layout } from '../CseMachineLayout';
import { Data } from '../CseMachineTypes';
import { defaultSAColor } from '../CseMachineUtils';
import { Arrow } from './arrows/Arrow';
import { ArrowFromArrayUnit } from './arrows/ArrowFromArrayUnit';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { PrimitiveValue } from './values/PrimitiveValue';
import { Value } from './values/Value';

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
  parent: ArrayValue;
  arrow: Arrow | undefined = undefined;
  index: Text;

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
    this._x = this.parent.x() + this.idx * CompactConfig.DataUnitWidth;
    this._y = this.parent.y();
    this._height = CompactConfig.DataUnitHeight;
    this._width = CompactConfig.DataUnitWidth;
    this.isFirstUnit = this.idx === 0;
    this.isLastUnit = this.idx === this.parent.data.length - 1;
    this.value = Layout.createCompactValue(this.data, this);
    this.isMainReference = this.value.referencedBy.length > 1;
    this.index = new Text(this.idx, this.x(), this.y() - 0.4 * this.height());
  }

  updatePosition = () => {};

  onMouseEnter = () => {};

  onMouseLeave = () => {};

  draw(): React.ReactNode {
    if (this.isDrawn()) return null;
    this._isDrawn = true;

    const cornerRadius = {
      upperLeft: 0,
      lowerLeft: 0,
      upperRight: 0,
      lowerRight: 0
    };

    if (this.isFirstUnit)
      cornerRadius.upperLeft = cornerRadius.lowerLeft = Number(CompactConfig.DataCornerRadius);
    if (this.isLastUnit)
      cornerRadius.upperRight = cornerRadius.lowerRight = Number(CompactConfig.DataCornerRadius);

    return (
      <React.Fragment key={Layout.key++}>
        <RoundedRect
          key={Layout.key++}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          stroke={defaultSAColor()}
          hitStrokeWidth={Number(CompactConfig.DataHitStrokeWidth)}
          fillEnabled={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          cornerRadius={cornerRadius}
          forwardRef={this.ref}
        />
        {this.index.draw()}
        {this.value.draw()}
        {this.value instanceof PrimitiveValue || new ArrowFromArrayUnit(this).to(this.value).draw()}
      </React.Fragment>
    );
  }
}
