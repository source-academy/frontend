import React from 'react';

import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { ReferenceType, Unassigned } from '../../CseMachineTypes';
import { getTextWidth } from '../../CseMachineUtils';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this class encapsulates an unassigned value in Source, internally represented as a symbol */
export class UnassignedValue extends Value {
  readonly data: Unassigned = Symbol();
  readonly text: Text;

  constructor(reference: ReferenceType) {
    super();
    this.references = [reference];

    // derive the coordinates from the main reference (binding / array unit)
    if (reference instanceof Binding) {
      this._x = reference.x() + getTextWidth(reference.keyString) + Config.TextPaddingX;
      this._y = reference.y();
      this.text = new Text(Config.UnassignedData, this._x, this._y, {
        isStringIdentifiable: false
      });
    } else {
      const maxWidth = reference.width();
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this._x = reference.x() + (reference.width() - textWidth) / 2;
      this._y = reference.y() + (reference.height() - Config.FontSize) / 2;
      this.text = new Text(Config.UnassignedData, this._x, this._y, {
        maxWidth: maxWidth,
        isStringIdentifiable: false
      });
    }

    this._width = this.text.width();
    this._height = this.text.height();
  }

  handleNewReference(): void {
    throw new Error('Unassigned value cannot have more than one reference!');
  }

  draw(): React.ReactNode {
    this._isDrawn = true;
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
