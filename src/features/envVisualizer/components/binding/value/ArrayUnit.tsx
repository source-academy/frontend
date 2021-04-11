import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Rect } from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Data, Visible } from '../../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../../EnvVisualizerUtils';
import { Arrow } from '../../Arrow';
import { Value } from '../Value';
import { ArrayValue } from './ArrayValue';
import { FnValue } from './FnValue';
import { PrimitiveValue } from './PrimitiveValue';

/** this class encapsulates a single unit (box) of array to be rendered.
 *  this unit is part of an ArrayValue */
export class ArrayUnit implements Visible {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly value: Value;

  /** check if this is the last unit in the array */
  readonly isLastUnit: boolean;
  /** check if this unit is the main reference of the value */
  readonly isMainReference: boolean;
  /** check if the value is already drawn (to prevent cyclic issues) */
  private isDrawn: boolean = false;

  constructor(
    /** index of this unit in its parent */
    readonly idx: number,
    /** the value this unit contains*/
    readonly data: Data,
    /** parent of this unit */
    readonly parent: ArrayValue
  ) {
    this.x = this.parent.x + this.idx * Config.DataUnitWidth;
    this.y = this.parent.y;
    this.height = Config.DataUnitHeight;
    this.width = Config.DataUnitWidth;
    this.isLastUnit = this.idx === this.parent.data.length - 1;
    this.value = Layout.createValue(this.data, this);
    this.isMainReference = this.value.referencedBy.length > 1;
  }

  onMouseEnter = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setHoveredStyle(currentTarget);
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    setUnhoveredStyle(currentTarget);
  };

  draw(): React.ReactNode {
    if (this.isDrawn) return null;
    this.isDrawn = true;

    let arrowPoints: number[] = [];
    const to: Value = this.value;
    if (!(this.value instanceof PrimitiveValue)) {
      arrowPoints = [this.x + Config.DataUnitWidth / 2, this.y + Config.DataUnitHeight / 2];

      if (to instanceof FnValue) {
        if (this.x < to.x) arrowPoints.push(to.x, to.y);
        else arrowPoints.push(to.centerX, to.y);
      } else if (to instanceof ArrayValue) {
        if (this.y === to.y && Math.abs(this.x - to.x) > Config.DataUnitWidth * 2) {
          arrowPoints.push(
            this.x + Config.DataUnitWidth / 2,
            this.y - Config.DataUnitHeight / 2,
            to.x + Config.DataUnitWidth / 2,
            to.y - Config.DataUnitHeight / 2,
            to.x + Config.DataUnitWidth / 2,
            to.y
          );
        } else if (this.y < to.y) {
          arrowPoints.push(to.x + Config.DataUnitWidth / 2, to.y);
        } else if (this.y > to.y) {
          arrowPoints.push(to.x + Config.DataUnitWidth / 2, to.y + Config.DataUnitHeight);
        } else {
          arrowPoints.push(to.x, to.y + Config.DataUnitHeight / 2);
        }
      } else {
        arrowPoints.push(to.x, to.y);
      }
    }

    return (
      <React.Fragment key={Layout.key++}>
        <Rect
          key={Layout.key++}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          stroke={Config.SA_WHITE.toString()}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
        {this.value.draw()}
        {arrowPoints && new Arrow(arrowPoints).draw()}
      </React.Fragment>
    );
  }
}
