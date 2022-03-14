import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';

import EnvVisualizer from '../EnvVisualizer';
import { Config } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Visible } from '../EnvVisualizerTypes';
import { setHoveredStyle, setUnhoveredStyle } from '../EnvVisualizerUtils';
import { Arrow } from './arrows/Arrow';
import { RoundedRect } from './shapes/RoundedRect';
import { ArrayValue } from './values/ArrayValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';
import { PrimitiveValue } from './values/PrimitiveValue';
import { Value } from './values/Value';

/** this class encapsulates a single unit (box) of array to be rendered.
 *  this unit is part of an ArrayValue */
export class ArrayUnit implements Visible {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  readonly value: Value;

  /** check if this is the first unit in the array */
  readonly isFirstUnit: boolean;
  /** check if this is the last unit in the array */
  readonly isLastUnit: boolean;
  /** check if this unit is the main reference of the value */
  readonly isMainReference: boolean;
  /** check if the value is already drawn */
  private isDrawn: boolean = false;
  ref: RefObject<any> = React.createRef();

  parent: ArrayValue;

  constructor(
    /** index of this unit in its parent */
    readonly idx: number,
    /** the value this unit contains*/
    readonly data: Data,
    /** parent of this unit */
    parent: ArrayValue
  ) {
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

  updatePosition = () => {
    this._x = this.parent.x() + this.idx * Config.DataUnitWidth;
    this._y = this.parent.y();
    this.value instanceof PrimitiveValue && this.value.updatePosition();
  };

  reset = () => {
    this.isDrawn = false;
  };

  onMouseEnter = () => {
    this.parent.units.forEach(u => {
      setHoveredStyle(u.ref.current);
    });
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (!this.parent.isSelected()) {
      this.parent.units.forEach(u => {
        setUnhoveredStyle(u.ref.current);
      });
    } else {
      const container = currentTarget.getStage()?.container();
      container && (container.style.cursor = 'default');
    }
  };

  onClick = () => {
    this.parent.onClick();
  };

  draw(): React.ReactNode {
    if (this.isDrawn) return null;
    this.isDrawn = true;

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
    let arrow: Arrow | undefined = undefined;
    if (!(this.value instanceof PrimitiveValue)) {
      arrow = Arrow.from(this).to(this.value);
      this.parent.addArrow(arrow);
      if (this.value instanceof ArrayValue) {
        this.value.addArrow(arrow);
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
            EnvVisualizer.getPrintableMode()
              ? Config.SA_BLUE.toString()
              : Config.SA_WHITE.toString()
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
        {arrow && arrow.draw()}
      </React.Fragment>
    );
  }
}
