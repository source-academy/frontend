import React from 'react';

import { CompactConfig } from '../../CseMachineCompactConfig';
import { Layout } from '../../CseMachineLayout';
import { CompactReferenceType, UnassignedData } from '../../CseMachineTypes';
import { getTextWidth } from '../../CseMachineUtils';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this class encapsulates an unassigned value in Source, internally represented as a symbol */
export class UnassignedValue extends Value {
  readonly data: UnassignedData = Symbol();
  readonly text: Text;

  constructor(readonly referencedBy: CompactReferenceType[]) {
    super();

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x =
        mainReference.x() + getTextWidth(mainReference.keyString) + CompactConfig.TextPaddingX;
      this._y = mainReference.y();
      this.text = new Text(CompactConfig.UnassignedData.toString(), this._x, this._y, {
        isStringIdentifiable: false
      });
    } else {
      const maxWidth = mainReference.width();
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this._x = mainReference.x() + (mainReference.width() - textWidth) / 2;
      this._y = mainReference.y() + (mainReference.height() - CompactConfig.FontSize) / 2;
      this.text = new Text(CompactConfig.UnassignedData.toString(), this._x, this._y, {
        maxWidth: maxWidth,
        isStringIdentifiable: false
      });
    }

    this._width = this.text.width();
    this._height = this.text.height();
  }

  reset(): void {
    super.reset();
    this.referencedBy.length = 0;
  }
  updatePosition(): void {}

  draw(): React.ReactNode {
    this._isDrawn = true;
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
