import React from 'react';

import { CompactConfig } from '../EnvVisualizerCompactConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Visible } from '../EnvVisualizerTypes';
import { isCompactMainReference, isDummyKey } from '../EnvVisualizerUtils';
import { Arrow } from './arrows/Arrow';
import { Frame } from './Frame';
import { Text } from './Text';
import { ArrayValue } from './values/ArrayValue';
import { FnValue } from './values/FnValue';
import { GlobalFnValue } from './values/GlobalFnValue';
import { PrimitiveValue } from './values/PrimitiveValue';
import { UnassignedValue } from './values/UnassignedValue';
import { Value } from './values/Value';

/** a `binding` is a key-value pair in a frame */
export class Binding implements Visible {
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;

  /** value associated with this binding */
  readonly value: Value;
  /** key of this binding */
  readonly key: Text;
  /**
   * `true` if this is a dummy binding
   * i.e. the value is anonymous
   */
  readonly isDummyBinding: boolean = false;
  private arrow: Arrow | undefined = undefined;
  public getArrow = (): Arrow | undefined => {
    return this.arrow;
  };

  constructor(
    /** the key of this binding */
    readonly keyString: string,
    /** the value of this binding */
    readonly data: Data,
    /** frame this binding is in */
    readonly frame: Frame,
    /** previous binding (the binding above it) */
    readonly prevBinding: Binding | null,
    readonly isConstant: boolean = false
  ) {
    this.isDummyBinding = isDummyKey(this.keyString);

    // derive the coordinates from the binding above it
    if (this.prevBinding) {
      this._x = this.prevBinding.x();
      this._y = this.prevBinding.y() + this.prevBinding.height() + CompactConfig.TextPaddingY;
    } else {
      this._x = this.frame.x() + CompactConfig.FramePaddingX;
      this._y = this.frame.y() + CompactConfig.FramePaddingY;
    }

    this.keyString += isConstant ? CompactConfig.ConstantColon : CompactConfig.VariableColon;
    this.value = Layout.createCompactValue(data, this);

    const keyYOffset =
      this.value instanceof ArrayValue
        ? (CompactConfig.DataUnitHeight - CompactConfig.FontSize) / 2
        : (this.value.height() - CompactConfig.FontSize) / 2;

    this.key = new Text(this.keyString, this.x(), this.y() + keyYOffset);

    // derive the width from the right bound of the value
    this._width = isCompactMainReference(this.value, this)
      ? this.value.x() +
        this.value.width() -
        this.x() +
        (this.value instanceof FnValue || this.value instanceof GlobalFnValue
          ? this.value.tooltipWidth
          : 0)
      : this.key.width();

    this._height = Math.max(this.key.height(), this.value.height());

    if (this.isDummyBinding && !isCompactMainReference(this.value, this)) {
      if (this.prevBinding) {
        this._y = this.prevBinding.y();
        this._width = this.prevBinding.width();
        this._height = this.prevBinding.height();
      }
    }
  }
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  width(): number {
    return this._width;
  }
  height(): number {
    return this._height;
  }
  ref?: React.RefObject<any> | undefined;

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        {this.isDummyBinding
          ? null // omit the key since value is anonymous
          : this.key.draw()}
        {this.isDummyBinding || // value is unreferenced in dummy binding
        this.value instanceof PrimitiveValue ||
        this.value instanceof UnassignedValue
          ? null
          : Arrow.from(this.key).to(this.value).draw()}
        {isCompactMainReference(this.value, this) ? this.value.draw() : null}
      </React.Fragment>
    );
  }
}
