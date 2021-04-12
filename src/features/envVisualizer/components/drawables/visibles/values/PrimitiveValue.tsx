import React from 'react';

import { Config } from '../../../../EnvVisualizerConfig';
import { Layout } from '../../../../EnvVisualizerLayout';
import { PrimitiveTypes, ReferenceType } from '../../../../EnvVisualizerTypes';
import { getTextWidth, isNull } from '../../../../EnvVisualizerUtils';
import { ArrayNullUnit } from '../ArrayNullUnit';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this classes encapsulates a primitive value in Source: number, string or null */
export class PrimitiveValue extends Value {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;

  /** the text to be rendered */
  readonly text: Text | ArrayNullUnit;

  constructor(
    /** data */
    readonly data: PrimitiveTypes,
    /** what this value is being referenced by */
    readonly referencedBy: ReferenceType[]
  ) {
    super();

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this.x = mainReference.x + getTextWidth(mainReference.keyString) + Config.TextPaddingX;
      this.y = mainReference.y;
      this.text = new Text(String(this.data), this.x, this.y);
    } else {
      const maxWidth = mainReference.width;
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this.x = mainReference.x + (mainReference.width - textWidth) / 2;
      this.y = mainReference.y + (mainReference.height - Config.FontSize) / 2;
      this.text = isNull(this.data)
        ? new ArrayNullUnit([mainReference])
        : new Text(String(this.data), this.x, this.y, { maxWidth: maxWidth });
    }

    this.width = this.text.width;
    this.height = this.text.height;
  }

  draw(): React.ReactNode {
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
