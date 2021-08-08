import React from 'react';

import { Config } from '../EnvVisualizerConfig';
import { Layout } from '../EnvVisualizerLayout';
import { Data, Visible } from '../EnvVisualizerTypes';
import { isMainReference } from '../EnvVisualizerUtils';
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
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  /** value associated with this binding */
  readonly value: Value;
  /** key of this binding */
  readonly key: Text;

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
    // derive the coordinates from the binding above it
    if (this.prevBinding) {
      this.x = this.prevBinding.x;
      this.y = this.prevBinding.y + this.prevBinding.height + Config.TextPaddingY;
    } else {
      this.x = this.frame.x + Config.FramePaddingX;
      this.y = this.frame.y + Config.FramePaddingY;
    }

    this.keyString += isConstant ? Config.ConstantColon : Config.VariableColon;
    this.value = Layout.createValue(data, this);

    const keyYOffset =
      this.value instanceof ArrayValue
        ? (Config.DataUnitHeight - Config.FontSize) / 2
        : (this.value.height - Config.FontSize) / 2;

    this.key = new Text(this.keyString, this.x, this.y + keyYOffset);

    // derive the width from the right bound of the value
    this.width = isMainReference(this.value, this)
      ? this.value.x +
        this.value.width -
        this.x +
        (this.value instanceof FnValue || this.value instanceof GlobalFnValue
          ? this.value.tooltipWidth
          : 0)
      : this.key.width;
    this.height = Math.max(this.key.height, this.value.height);
  }

  draw(): React.ReactNode {
    return (
      <React.Fragment key={Layout.key++}>
        {this.key.draw()}
        {isMainReference(this.value, this) ? this.value.draw() : null}
        {this.value instanceof PrimitiveValue ||
          this.value instanceof UnassignedValue ||
          Arrow.from(this.key).to(this.value).draw()}
      </React.Fragment>
    );
  }
}
