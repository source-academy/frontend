import React from 'react';

import { Config } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { ReferenceType, UnassignedData } from '../../EnvVisualizerTypes';
import { getTextWidth } from '../../EnvVisualizerUtils';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this class encapsulates an unassigned value in Source, internally represented as a symbol */
export class UnassignedValue extends Value {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly data: UnassignedData = Symbol();
  readonly text: Text;

  constructor(readonly referencedBy: ReferenceType[]) {
    super();

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this.x = mainReference.x + getTextWidth(mainReference.keyString) + Config.TextPaddingX;
      this.y = mainReference.y;
      this.text = new Text(Config.UnassignedData.toString(), this.x, this.y, {
        isStringIdentifiable: false
      });
    } else {
      const maxWidth = mainReference.width;
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this.x = mainReference.x + (mainReference.width - textWidth) / 2;
      this.y = mainReference.y + (mainReference.height - Config.FontSize) / 2;
      this.text = new Text(Config.UnassignedData.toString(), this.x, this.y, {
        maxWidth: maxWidth,
        isStringIdentifiable: false
      });
    }

    this.width = this.text.width;
    this.height = this.text.height;
  }

  draw(): React.ReactNode {
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
