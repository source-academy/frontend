import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Rect } from 'react-konva';

import { Config } from '../../../EnvVisualizerConfig';
import { Layout } from '../../../EnvVisualizerLayout';
import { Data, Hoverable, Visible } from '../../../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../../../EnvVisualizerUtils';
import { RoundedRect } from '../../shapes/RoundedRect';
import { Arrow } from './Arrow';
import { ArrayValue } from './values/ArrayValue';
import { PrimitiveValue } from './values/PrimitiveValue';
import { Value } from './values/Value';

/** this class encapsulates a single unit (box) of array to be rendered.
 *  this unit is part of a parent, either an ArrayValue */
export class ArrayUnit implements Visible, Hoverable {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly value: Value;
  /** check if this is the first unit in the array */
  readonly isFirstUnit: boolean;
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
    this.isFirstUnit = this.idx === 0;
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

  renderUnit = (): React.ReactNode => {
    if (this.isFirstUnit) {
      return (
        <RoundedRect
          key={Layout.key++}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          cornerRadius={{
            upperLeft: Number(Config.DataCornerRadius),
            lowerLeft: Number(Config.DataCornerRadius),
            upperRight: 0,
            lowerRight: 0
          }}
          stroke={Config.SA_WHITE.toString()}
          hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
          fillEnabled={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
      );
    } else if (this.isLastUnit) {
      return (
        <RoundedRect
          key={Layout.key++}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          cornerRadius={{
            upperLeft: 0,
            lowerLeft: 0,
            upperRight: Number(Config.DataCornerRadius),
            lowerRight: Number(Config.DataCornerRadius)
          }}
          stroke={Config.SA_WHITE.toString()}
          hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
          fillEnabled={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
      );
    } else {
      return (
        <Rect
          key={Layout.key++}
          x={this.x}
          y={this.y}
          width={this.width}
          height={this.height}
          stroke={Config.SA_WHITE.toString()}
          hitStrokeWidth={Number(Config.DataHitStrokeWidth)}
          fillEnabled={false}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        />
      );
    }
  };

  draw(): React.ReactNode {
    if (this.isDrawn) return null;
    this.isDrawn = true;
    return (
      <React.Fragment key={Layout.key++}>
        {this.renderUnit()}
        {this.value.draw()}
        {this.value instanceof PrimitiveValue || new Arrow(this, this.value).draw()}
      </React.Fragment>
    );
  }
}
