import React from 'react';

import { Config } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { Unassigned } from '../../CseMachineTypes';
import { getTextWidth } from '../../CseMachineUtils';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this class encapsulates an unassigned value in Source, internally represented as a symbol */
export class UnassignedValue extends Value {
  readonly data: Unassigned = Symbol();
  readonly text: Text;

  constructor(reference: Binding) {
    super();
    this.references = [reference];

    this._x = reference.x() + getTextWidth(reference.keyString) + Config.TextPaddingX;
    this._y = reference.y();
    this.text = new Text(Config.UnassignedData, this._x, this._y, {
      isStringIdentifiable: false
    });

    this._width = this.text.width();
    this._height = this.text.height();
    this.ref = this.text.ref;
  }

  handleNewReference(): void {
    throw new Error('Unassigned value cannot have more than one reference!');
  }

  draw(): React.ReactNode {
    this._isDrawn = true;
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
