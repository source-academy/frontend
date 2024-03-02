import { KonvaEventObject } from 'konva/lib/Node';
import React from 'react';

import { Data, IHoverable, ReferenceType } from '../../CseMachineTypes';
import { Visible } from '../Visible';

/** the value of a `Binding` or an `ArrayUnit` */
export abstract class Value extends Visible implements IHoverable {
  abstract onMouseEnter(e: KonvaEventObject<MouseEvent>): void;
  abstract onMouseLeave(e: KonvaEventObject<MouseEvent>): void;

  /** draw logic */
  abstract draw(key?: number): React.ReactNode;
  /** add reference (binding / array unit) to this value */
  addReference(newReference: ReferenceType): void {
    this.referencedBy.push(newReference);
  }
  abstract updatePosition(pos?: { x: number; y: number }): void;

  /** references to this value */
  abstract referencedBy: ReferenceType[];
  /** the underlying data of this value */
  abstract readonly data: Data;
}
