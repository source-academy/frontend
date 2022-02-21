import React from 'react';

import { Config } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Visible } from '../EnvVisualizerTypes';
import { isDummyKey, isMainReference } from '../EnvVisualizerUtils';
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
  readonly offsetY: number;
  private _width: number;
  /** The maximum width of binding when hovered or clicked (takes tooltip into consideration) */
  private _hoveredWidth: number;
  private _height: number;
  readonly isMainReference: boolean;

  /** value associated with this binding */
  readonly value: Value;
  /** key of this binding */
  readonly key: Text;
  /**
   * `true` if this is a dummy binding
   * i.e. the value is anonymous
   */
  readonly isDummyBinding: boolean = false;
  keyYOffset: number;

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
      this.offsetY = this.prevBinding.offsetY + this.prevBinding.height() + Config.TextPaddingY;
    } else {
      this._x = this.frame.x() + Config.FramePaddingX;
      this.offsetY = this.frame.y() + Config.FramePaddingY;
    }
    this._y = this.offsetY;

    this.keyString += isConstant ? Config.ConstantColon : Config.VariableColon;
    this.value = Layout.createValue(data, this);
    this.isMainReference = isMainReference(this.value, this);
    if (this.isMainReference) {
      // Moves the function object next to the correct frame
      this.value.updatePosition();
    }
    this.keyYOffset =
      (this.value instanceof FnValue || this.value instanceof GlobalFnValue) && this.isMainReference
        ? (this.value.height() - Config.FontSize) / 2
        : 0;
    this.key = new Text(this.keyString, this.x(), this.offsetY + this.keyYOffset);

    // derive the width from the right bound of the value (either no extra space or width of function object.)
    this._width =
      !(this.value instanceof ArrayValue) && this.isMainReference
        ? this.value.x() + this.value.width() - this.x()
        : this.key.width();
    this._hoveredWidth =
      this._width +
      (this.value instanceof FnValue || this.value instanceof GlobalFnValue
        ? this.value.tooltipWidth
        : 0);
    this._height = Math.max(
      this.key.height(),
      (this.value instanceof FnValue || this.value instanceof GlobalFnValue) && this.isMainReference
        ? this.value.height()
        : 0
    );

    if (this.isDummyBinding && !this.isMainReference) {
      if (this.prevBinding) {
        this.offsetY = this.prevBinding.offsetY;
        this._width = this.prevBinding.width();
        this._height = this.prevBinding.height();
      }
    }
    this._y = this.offsetY;
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
  hoveredWidth(): number {
    return this._hoveredWidth;
  }
  /**
   * update absolute position of binding and its value.
   * @param x Target x-position
   * @param y Target y-position
   */
  updatePosition = (x: number, y: number) => {
    this._x = x + Config.FramePaddingX;
    this._y = y + this.offsetY;
    this.key.updatePosition(this.x(), this.y() + this.keyYOffset);
    if (isMainReference(this.value, this)) {
      this.value.updatePosition();
    }
  };

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        {this.isDummyBinding
          ? null // omit the key since value is anonymous
          : this.key.draw()}
        {this.isDummyBinding || // value is unreferenced in dummy binding
        this.value instanceof PrimitiveValue ||
        this.value instanceof UnassignedValue ||
        this.value instanceof ArrayValue // Draw Arrays afterwards
          ? null
          : Arrow.from(this.key).to(this.value).draw()}
        {!(this.value instanceof ArrayValue) && this.isMainReference ? this.value.draw() : null}
        {/* {!(this.value instanceof ArrayValue) && this.value.draw()} */}
      </React.Fragment>
    );
  }
}
