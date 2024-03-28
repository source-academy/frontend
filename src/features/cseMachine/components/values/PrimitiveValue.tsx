import React from 'react';

import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { Primitive, ReferenceType } from '../../CseMachineTypes';
import { getTextWidth, isNull } from '../../CseMachineUtils';
import { ArrayNullUnit } from '../ArrayNullUnit';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this classes encapsulates a primitive value in Source: number, string or null */
export class PrimitiveValue extends Value {
  /** the text to be rendered */
  readonly text: Text | ArrayNullUnit;

  constructor(
    /** data */
    readonly data: Primitive,
    /** what this value is being referenced by */
    reference: ReferenceType
  ) {
    super();
    this.references = [reference];

    // derive the coordinates from the main reference (binding / array unit)
    if (reference instanceof Binding) {
      this._x = reference.x() + getTextWidth(reference.keyString) + Config.TextPaddingX;
      this._y = reference.y();
      this.text = new Text(this.data, this.x(), this.y(), { isStringIdentifiable: true });
    } else {
      const maxWidth = reference.width();
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this._x = reference.x() + (reference.width() - textWidth) / 2;
      this._y = reference.y() + (reference.height() - Config.FontSize) / 2;
      this.text = isNull(this.data)
        ? new ArrayNullUnit(reference)
        : new Text(this.data, this.x(), this.y(), {
            maxWidth: maxWidth,
            isStringIdentifiable: true
          });
    }

    this._width = this.text.width();
    this._height = this.text.height();
  }

  handleNewReference(): void {
    throw new Error('Primitive values cannot have more than one reference!');
  }

  draw(): React.ReactNode {
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
